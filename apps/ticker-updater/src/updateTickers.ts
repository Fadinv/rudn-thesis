import axios from 'axios';
import {Client} from 'pg';
import {SP500List} from './SP500List';

const API_KEY = process.env.POLYGON_API_KEY!;
const DB_URL = process.env.DATABASE_URL!;
const STOCK_API_URL = `https://api.polygon.io/v3/reference/tickers?market=stocks&active=true&limit=1000&apiKey=${API_KEY}`;

const REQUEST_DELAY = 250; // ⏳ 250 мс между запросами
const MAX_RETRIES = 5; // 🔄 Повтор запроса до 5 раз

// ⏳ Функция задержки перед каждым API-запросом
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 🔄 Функция с обработкой 429 и повторными попытками
async function fetchWithRetry(url: string, retries = MAX_RETRIES) {
	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			const response = await axios.get(url);
			return response.data;
		} catch (error: any) {
			if (error.response?.status === 429) {
				console.warn(`⚠️ 429 Too Many Requests. Повтор через 5 сек (попытка ${attempt})`);
				await sleep(5000); // ⏳ Ждем 5 секунд перед повтором
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
	await sleep(REQUEST_DELAY); // ⏳ Делаем задержку между запросами

	const url = `https://api.polygon.io/v3/reference/tickers/${ticker}?apiKey=${API_KEY}`;
	return fetchWithRetry(url);
}

const tickersStrings = new Set<string>();

// 🔄 Обновляем тикеры в БД
async function updateTickers() {
	const client = new Client({connectionString: DB_URL});
	await client.connect();

	const tickers = await fetchTickers();
	if (tickers.length === 0) {
		console.log('❌ Нет новых данных.');
		await client.end();
		return;
	}

	let count = 0;
	for (const ticker of tickers) {
		tickersStrings.add(ticker.ticker);
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

	console.log(`✅ Обновлено ${tickers.length} тикеров.`);
	console.log('tickersStrings', tickersStrings.size);

	SP500List.forEach((value) => {
		if (!tickersStrings.has(value)) {
			console.log('Нет тикера из S&P500', value);
		}
	})
	await client.end();
}


export {updateTickers};
