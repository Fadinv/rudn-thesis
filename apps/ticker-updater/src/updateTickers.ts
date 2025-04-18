import axios from 'axios';
import * as dotenv from 'dotenv';
import {In} from 'typeorm';
import {
	AppDataSource,
	Stock,
	StockPrice,
} from '@service/orm';
import {SP500List} from './SP500List';

dotenv.config({path: '../../.env.shared'});
dotenv.config({path: './.env'});

const API_KEY = process.env.POLYGON_API_KEY!;
const STOCK_API_URL = `https://api.polygon.io/v3/reference/tickers?market=stocks&active=true&limit=1000&apiKey=${API_KEY}`;

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
	const tickers = await fetchTickers();
	if (!tickers?.length) {
		console.log('❌ Нет данных для обновления.');
		return;
	}

	const insertedTickers: string[] = [];

	for (const ticker of tickers) {
		if (!SP500List.has(ticker.ticker)) continue;

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
		});

		await stockRepo.upsert(stock, ['ticker']);
		console.log(`Тикер обновлен ${ticker.ticker}`);
		insertedTickers.push(ticker.ticker);
	}

	console.log(`✅ Обновлено ${insertedTickers.length} тикеров.`);

	for (const ticker of insertedTickers) {
		await updateStockPrices(ticker);
	}
}
