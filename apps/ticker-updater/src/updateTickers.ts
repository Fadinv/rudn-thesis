import axios from 'axios';
import * as dotenv from 'dotenv';
import {
	AppDataSource,
	Stock,
	StockPrice,
} from '@service/orm';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {SP500List} from './SP500List';
import {fxList} from './fx-list';
import {createUsdRubTicker} from './helpers/createUsdRubTickers';

dotenv.config({path: '../../.env.shared'});
dotenv.config({path: './.env'});

const API_KEY = process.env.POLYGON_API_KEY!;
const STOCK_API_URL = `https://api.polygon.io/v3/reference/tickers?market=stocks&active=true&limit=1000&apiKey=${API_KEY}`;
const CSV_PATH = path.resolve(__dirname, 'csv/USD_RUB_Historical_Data.csv');

const FROM_DATE = new Date(new Date().setFullYear(new Date().getFullYear() - 3)).toISOString().split('T')[0];
const TO_DATE = new Date().toISOString().split('T')[0];

const MAX_RETRIES = 5;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<any> {
	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			const response = await axios.get(url);
			return response.data;
		} catch (error: any) {
			if (error.response?.status === 429) {
				console.warn(`⚠️ 429 Too Many Requests. Повтор через 5 сек (попытка ${attempt})`);
				await sleep(5000);
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

async function fetchTickerDetails(ticker: string) {
	const url = `https://api.polygon.io/v3/reference/tickers/${ticker}?apiKey=${API_KEY}`;
	return fetchWithRetry(url);
}

async function updateStockPrices(ticker: string) {
	const priceRepo = AppDataSource.getRepository(StockPrice);

	const last = await priceRepo.findOne({
		where: {ticker},
		order: {date: 'DESC'},
	});

	let fromDate = FROM_DATE;
	if (last?.date) {
		const nextDate = new Date(last.date);
		nextDate.setDate(nextDate.getDate() + 1);
		fromDate = nextDate.toISOString().split('T')[0];
	}

	if (new Date(fromDate) >= new Date(TO_DATE)) {
		console.log(`⏭️ Пропускаем ${ticker}, актуальные котировки уже загружены.`);
		return;
	}

	console.log(`📊 Догружаем котировки для ${ticker} с ${fromDate} по ${TO_DATE}`);

	const response = await fetchWithRetry(
		`https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${fromDate}/${TO_DATE}?apiKey=${API_KEY}`,
	);

	if (!response?.results?.length) {
		console.log(`⚠️ Нет котировок для ${ticker}`);
		return;
	}

	const records = response.results.map((r: any) =>
		priceRepo.create({
			ticker,
			date: new Date(r.t).toISOString().split('T')[0],
			open: r.o,
			high: r.h,
			low: r.l,
			close: r.c,
			volume: r.v,
		}),
	);

	await priceRepo.upsert(records, ['ticker', 'date']); // ✅ батч-вставка

	console.log(`✅ Котировки для ${ticker} обновлены!`);
}

export async function updateTickers() {
	const stockRepo = AppDataSource.getRepository(Stock);

	const tickers = await fetchTickers()
	// const tickers: any[] = [];
	if (!tickers?.length) {
		console.log('❌ Нет данных для обновления.');
		// return;
	}

	const usdRub = await createUsdRubTicker();
	tickers.push(usdRub);

	const insertedTickers: string[] = [];

	for (const ticker of tickers) {
		if (!SP500List.has(ticker.ticker) && !fxList.has(ticker.ticker)) continue;

		let logoUrl: string | undefined = undefined;

		try {
			const details = await fetchTickerDetails(ticker.ticker);
			logoUrl = details?.results?.branding?.logo_url || null;
		} catch {}

		const stock = stockRepo.create({
			ticker: ticker.ticker,
			name: ticker.name,
			market: ticker.market,
			locale: ticker.locale,
			primaryExchange: ticker.primary_exchange, // 👈 camelCase в классе
			type: ticker.type,
			active: ticker.active,
			currencyName: ticker.currency_name,
			cik: ticker.cik,
			compositeFigi: ticker.composite_figi,
			shareClassFigi: ticker.share_class_figi,
			lastUpdatedUtc: ticker.last_updated_utc,
			logoUrl: logoUrl,
			source: 'polygon',
			exchange: 'NASDAQ',
			// TODO: При изменении логики стоит доработать универсально
			isIndex: ticker.ticker === 'SPY',
		});

		await stockRepo.upsert(stock, ['ticker']);
		console.log(`Тикер обновлен ${ticker.ticker}`);
		insertedTickers.push(ticker.ticker);
	}

	console.log(`✅ Обновлено ${insertedTickers.length} тикеров.`);

	if (process.env.USE_CSV_TICKER_LIST === 'true') {
		await importUsdRubFromCsv();
	}

	for (const ticker of insertedTickers) {
		await updateStockPrices(ticker);
	}
}

async function importUsdRubFromCsv() {
	const priceRepo = AppDataSource.getRepository(StockPrice);
	const stockRepo = AppDataSource.getRepository(Stock);

	const ticker = 'C:USDRUB';
	const isEnabled = process.env.USE_CSV_TICKER_LIST === 'true';
	if (!isEnabled) return;

	// Убедимся, что тикер есть в stock
	const existing = await stockRepo.findOneBy({ ticker });
	if (!existing) {
		const usdRubStock = stockRepo.create({
			ticker,
			name: 'USD / RUB',
			market: 'fx',
			locale: 'global',
			primaryExchange: 'FX',
			active: true,
			currencyName: 'RUB',
			source: 'polygon',
			exchange: 'FX',
			isIndex: false,
			lastUpdatedUtc: '',
		});
		await stockRepo.save(usdRubStock);
		console.log('📈 Тикер C:USDRUB добавлен');
	}

	const csvPath = path.resolve(__dirname, '../csv/USD_RUB_Historical_Data.csv');
	const fileContent = fs.readFileSync(csvPath, 'utf-8');
	const lines = fileContent.split('\n').slice(1); // пропускаем заголовок

	const records: StockPrice[] = [];

	for (const line of lines) {
		const [dateStr, priceStrRaw] = line.split(',').map(s => s.replace(/"/g, '').trim());

		if (!dateStr || !priceStrRaw) continue;

		// Парсим дату как MM/DD/YYYY → YYYY-MM-DD
		const [month, day, year] = dateStr.split('/');
		const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

		const price = parseFloat(priceStrRaw.replace(',', '.'));
		if (isNaN(price)) continue;

		records.push(priceRepo.create({
			ticker,
			date: isoDate,
			open: price,
			high: price,
			low: price,
			close: price,
			volume: 0,
		}));
	}

	await priceRepo.upsert(records, ['ticker', 'date']);
	console.log(`✅ Импортировано ${records.length} записей по курсу USD/RUB`);
}
