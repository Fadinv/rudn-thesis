import axios from 'axios';
import * as dotenv from 'dotenv';
import {
	AppDataSource,
	Stock,
	StockPrice,
} from '@service/orm';

dotenv.config({path: '../../.env.shared'});
dotenv.config({path: './.env.local'});

const INDEXES_STORE: Record<string, boolean> = {
	'IMOEX': true,
};

const MOEX_URL = process.env.MOEX_TICKERS_URL ?? '';
const MOEX_MARKET = 'MOEX';
const FROM_DATE = '2009-01-01';
const TO_DATE = new Date().toISOString().split('T')[0];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const boardPriority = ['TQBR', 'EQBR', 'SMAL', 'EQDP'];

async function fetchMoexTickers() {
	try {
		if (!MOEX_URL) return null;
		const response = await axios.get(MOEX_URL);
		const {data} = response;
		const columns: string[] = data.securities.columns;
		const rows: any[][] = data.securities.data;

		const colIndex = (name: string) => columns.indexOf(name);

		return rows.map(row => ({
			ticker: row[colIndex('SECID')],
			name: row[colIndex('SHORTNAME')],
			type: row[colIndex('SECTYPE')],
			currency: row[colIndex('CURRENCYID')],
			isin: row[colIndex('ISIN')],
			primaryBoardId: row[colIndex('PRIMARYBOARDID')],
		})).filter(t => !!t.ticker);
	} catch (err) {
		console.error('Ошибка при загрузке тикеров MOEX:', err);
		return [];
	}
}

export async function updateMoexTickers() {
	const repo = AppDataSource.getRepository(Stock);
	const INDEX_IMOEX: Omit<Stock, 'id'> = {
		ticker: 'IMOEX',
		name: 'Индекс МосБиржи',
		type: 'index',
		currencyName: 'SUR',
		market: MOEX_MARKET,
		locale: 'ru',
		primaryExchange: 'INDEX',
		compositeFigi: 'IMOEX_INDEX',
		cik: '',
		shareClassFigi: '',
		lastUpdatedUtc: new Date().toISOString(),
		logoUrl: '',
		active: true,
		source: 'moex',
		exchange: 'MOEX',
		isIndex: true,
	};

	await repo.upsert(repo.create(INDEX_IMOEX), ['ticker']);
	console.log(`✅ Индекс IMOEX добавлен в базу`);

	const moexTickers = await fetchMoexTickers();

	if (!moexTickers?.length) {
		console.log('❌ Нет тикеров MOEX для обновления');
		return;
	}

	let updated = 0;

	for (const ticker of moexTickers) {
		const stock = repo.create({
			ticker: ticker.ticker || '',
			name: ticker.name || '',
			type: ticker.type || '',
			currencyName: ticker.currency || '',
			market: MOEX_MARKET,
			locale: 'ru',
			primaryExchange: ticker.primaryBoardId || '',
			compositeFigi: ticker.isin || '',
			cik: '',
			shareClassFigi: '',
			lastUpdatedUtc: new Date().toISOString(),
			logoUrl: '',
			active: true,
			source: 'moex',
			exchange: 'MOEX',
			isIndex: false,
		});

		await repo.upsert(stock, ['ticker']);
		console.log(`✅ Обновлен тикер MOEX: ${ticker.ticker}`);
		updated++;
	}

	await updateMoexPrices();
	console.log(`🎉 Обновлено ${updated} тикеров MOEX`);
}

function pickBestRecordPerDate(data: any[], columns: string[]) {
	const colIndex = (name: string) => columns.indexOf(name);
	const grouped = new Map<string, any[]>();

	for (const row of data) {
		const date = row[colIndex('TRADEDATE')];
		if (!grouped.has(date)) grouped.set(date, []);
		grouped.get(date)!.push(row);
	}

	const result: Omit<StockPrice, 'id'>[] = [];

	for (const [date, rows] of grouped.entries()) {
		const sorted = rows.sort((a, b) => (
			boardPriority.indexOf(a[colIndex('BOARDID')]) -
			boardPriority.indexOf(b[colIndex('BOARDID')])
		));
		const best = sorted.find(row => row[colIndex('CLOSE')] != null);
		if (!best) continue;

		result.push({
			ticker: best[colIndex('SECID')],
			date,
			open: best[colIndex('OPEN')],
			high: best[colIndex('HIGH')],
			low: best[colIndex('LOW')],
			close: best[colIndex('CLOSE')],
			volume: best[colIndex('VOLUME')] ?? null,
		});
	}

	return result;
}

async function fetchAllMoexPrices(ticker: string, from: string) {
	const allData: any[] = [];
	let start = 0;
	let columns: string[] | null = null;

	while (true) {
		let url = (process.env.MOEX_HISTORY_URL ?? '')
			.replace('%ticker%', ticker)
			.replace('%from%', from)
			.replace('%start%', `${start}`);

		if (INDEXES_STORE[ticker]) {
			url = url.replace('/shares/', '/index/');
		}

		if (!url) break;
		try {
			const response = await axios.get(url);
			const result = response.data;

			if (INDEXES_STORE[ticker]) {
				console.log(result);
			}
			if (!columns) {
				columns = result?.history?.columns ?? null;
			}

			const pageData = result?.history?.data ?? [];
			if (!pageData.length) break;

			allData.push(...pageData);

			const total = result?.['history.cursor']?.data?.[0]?.[1];
			const pageSize = result?.['history.cursor']?.data?.[0]?.[2];
			start += pageSize;

			if (start >= total) break;
		} catch (error) {
			console.warn(`⚠️ Ошибка загрузки котировок для ${ticker}:`, error);
			await sleep(2000);
			break;
		}
	}

	if (!columns || !allData.length) return null;

	return {columns, data: allData};
}

export async function updateMoexPrices() {
	const priceRepo = AppDataSource.getRepository(StockPrice);
	const stockRepo = AppDataSource.getRepository(Stock);
	const stocks = await stockRepo.find({where: {market: MOEX_MARKET}});

	for (const stock of stocks) {
		const ticker = stock.ticker;
		const last = await priceRepo.findOne({where: {ticker}, order: {date: 'DESC'}});

		let fromDate = FROM_DATE;
		if (last?.date) {
			const nextDate = new Date(last.date);
			nextDate.setDate(nextDate.getDate() + 1);
			fromDate = nextDate.toISOString().split('T')[0];
		}

		if (new Date(fromDate) >= new Date(TO_DATE)) {
			console.log(`⏭️ Пропускаем ${ticker}, данные актуальны`);
			continue;
		}

		console.log(`📊 Загружаем котировки для ${ticker} с ${fromDate}`);
		const result = await fetchAllMoexPrices(ticker, fromDate);
		const columns = result?.columns;
		const data = result?.data;

		if (!columns || !data?.length) {
			console.log(`⚠️ Нет данных для ${ticker}`);
			continue;
		}

		const records = pickBestRecordPerDate(data, columns).map(record => priceRepo.create(record));

		if (records.length === 0) {
			console.log(`⚠️ Нет валидных записей для ${ticker}`);
			await stockRepo.update({ticker}, {active: false});
			continue;
		}

		await priceRepo.upsert(records, ['ticker', 'date']);
		console.log(`✅ Котировки для ${ticker} обновлены (${records.length})`);
	}
}