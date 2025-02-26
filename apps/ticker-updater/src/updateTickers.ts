import axios from 'axios';
import {Client} from 'pg';
import {SP500List} from './SP500List';

const API_KEY = process.env.POLYGON_API_KEY!;
const DB_URL = process.env.DATABASE_URL!;
const STOCK_API_URL = `https://api.polygon.io/v3/reference/tickers?market=stocks&active=true&limit=1000&apiKey=${API_KEY}`;

const FROM_DATE = new Date(new Date().setFullYear(new Date().getFullYear() - 3))
	.toISOString()
	.split('T')[0];
const TO_DATE = new Date().toISOString().split('T')[0];

const REQUEST_DELAY = 250;
const MAX_RETRIES = 5;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, retries = MAX_RETRIES) {
	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			const response = await axios.get(url);
			return response.data;
		} catch (error: any) {
			if (error.response?.status === 429) {
				console.warn(`⚠️ 429 Too Many Requests. Повтор через 5 сек (попытка ${attempt})`);
				await sleep(5000);
				return fetchWithRetry(url, retries);
			} else {
				console.error(`❌ Ошибка запроса: ${error.message}`);
				return null;
			}
		}
	}
	return null;
}

// 🏦 Получаем список всех акций
async function fetchTickers() {
	let tickers: any[] = [];
	let nextUrl: string | null = STOCK_API_URL;

	try {
		while (nextUrl) {
			console.log('Загружаем новые данные --- ', nextUrl);
			const data = await fetchWithRetry(nextUrl);
			if (data.results?.length) tickers = [...tickers, ...data.results];
			nextUrl = data?.next_url ? `${data.next_url}&apiKey=${API_KEY}` : null;
		}
	} catch (error) {
		nextUrl = null;
		console.error('❌ Ошибка запроса API:', error, nextUrl);
	}

	console.log('tickers', tickers.length);
	return tickers;
}

// 📈 Получаем цену и логотип для тикера
async function fetchTickerDetails(ticker: string) {
	await sleep(REQUEST_DELAY);
	const url = `https://api.polygon.io/v3/reference/tickers/${ticker}?apiKey=${API_KEY}`;
	return fetchWithRetry(url);
}

// Обновляем исторические котировки
async function updateStockPrices(client: Client, ticker: string) {
	try {
		// 🔍 Получаем последнюю загруженную дату для тикера
		const {rows} = await client.query(
			`SELECT MAX(date) AS last_date FROM stock_prices WHERE ticker = $1`,
			[ticker],
		);

		let fromDate = FROM_DATE; // 📅 Используем старый FROM_DATE по умолчанию
		if (rows[0]?.last_date) { // ✅ Если есть загруженные котировки
			const lastDate = new Date(rows[0].last_date);
			lastDate.setDate(lastDate.getDate() + 1); // ⏩ Двигаем дату вперед на 1 день
			fromDate = lastDate.toISOString().split('T')[0]; // Преобразуем в YYYY-MM-DD
		}

		const toDate = new Date().toISOString().split('T')[0]; // 📅 Сегодняшняя дата

		// Проверяем, чтобы `fromDate` ≤ `toDate`
		if (new Date(fromDate) >= new Date(toDate)) {
			console.log(`⏭️ Пропускаем ${ticker}, актуальные котировки уже загружены.`);
			return;
		}

		console.log(`📊 Догружаем котировки для ${ticker} с ${fromDate} по ${toDate}`);

		const response = await fetchWithRetry(
			`https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${fromDate}/${toDate}?apiKey=${API_KEY}`,
		);

		if (!response || !response.results) return;

		// 🔄 Формируем массив котировок
		const stockPrices = response.results.map((item: any) => ({
			ticker,
			date: new Date(item.t).toISOString().split('T')[0], // Преобразуем timestamp в YYYY-MM-DD
			open: item.o,
			high: item.h,
			low: item.l,
			close: item.c,
			volume: item.v,
		}));

		// 📌 Вставляем новые котировки, избегая дубликатов
		for (const price of stockPrices) {
			await client.query(
				`
                INSERT INTO stock_prices (ticker, date, open, high, low, close, volume)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (ticker, date) DO NOTHING;
                `,
				[price.ticker, price.date, price.open, price.high, price.low, price.close, price.volume],
			);
		}

		console.log(`✅ Котировки для ${ticker} обновлены!`);
	} catch (error) {
		console.error(`❌ Ошибка при обновлении котировок ${ticker}:`, error);
	}
}

// Обновляем тикеры в БД
async function updateTickers() {
	const client = new Client({connectionString: DB_URL});
	await client.connect();

	// const tickers = await fetchTickers();
	const tickers: any[] = [];
	if (tickers.length === 0) {
		console.log('❌ Нет новых данных.');
		// await client.end();
		// return;
	}

	let count = 0;

	for (const ticker of tickers) {
		if (SP500List.has(ticker.ticker)) {
			let logoUrl: string | null = null;
			try {
				const details = await fetchTickerDetails(ticker.ticker);
				logoUrl = details?.results?.branding?.logo_url || null;
				count++;
			} catch (_) {}

			await client.query(
				`
                  INSERT INTO stock (ticker, name, market, locale, primary_exchange, type, active, currency_name, cik, composite_figi, share_class_figi, last_updated_utc, logo_url)
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                  ON CONFLICT (ticker) DO UPDATE 
                  SET name = EXCLUDED.name, market = EXCLUDED.market, locale = EXCLUDED.locale, primary_exchange = EXCLUDED.primary_exchange, 
                      type = EXCLUDED.type, active = EXCLUDED.active, currency_name = EXCLUDED.currency_name, 
                      cik = EXCLUDED.cik, composite_figi = EXCLUDED.composite_figi, share_class_figi = EXCLUDED.share_class_figi, 
                      last_updated_utc = EXCLUDED.last_updated_utc, logo_url = EXCLUDED.logo_url;
                `,
				[
					ticker.ticker,
					ticker.name,
					ticker.market,
					ticker.locale,
					ticker.primary_exchange,
					ticker.type,
					ticker.active,
					ticker.currency_name,
					ticker.cik || null,
					ticker.composite_figi || null,
					ticker.share_class_figi || null,
					ticker.last_updated_utc,
					logoUrl,
				],
			);
		}
	}

	const result = await client.query('SELECT ticker FROM stock');
	const insertedTickers = new Set<string>(); // Будем хранить тикеры, которые реально попали в БД
	result.rows.forEach(row => insertedTickers.add(row.ticker));

	console.log(`✅ Обновлено ${insertedTickers.size} тикеров.`);

	// 🔥 🔄 Загружаем котировки только для тех тикеров, которые реально были добавлены в БД
	for (const ticker of insertedTickers) {
		await updateStockPrices(client, ticker);
	}

	await client.end();
}

export {updateTickers};
