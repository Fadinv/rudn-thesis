import axios from 'axios';
import {Client} from 'pg';

const API_KEY = process.env.API_KEY!;
const DB_URL = process.env.DATABASE_URL!;
const EODHD_API_TOKEN = process.env.EODHD_API_TOKEN!;
const API_URL = `https://api.polygon.io/v3/reference/tickers?market=stocks&active=true&limit=1000&apiKey=${API_KEY}`;

// Загружаем список S&P 500
const SP500_TICKERS = new Set([
	'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'BRK.B', 'JPM', 'UNH',
	// Добавь полный список S&P 500 сюда
]);

async function fetchTickers() {
	let tickers: any[] = [];
	let nextUrl: string | null = API_URL;

	try {
		while (nextUrl) {
			// @ts-ignore
			const response = await axios.get(nextUrl);
			if (!response.data.results || response.data.results.length === 0) break;

			tickers = tickers.concat(response.data.results);
			// nextUrl = response.data.next_url ? `${response.data.next_url}&apiKey=${API_KEY}` : null;
			nextUrl = null;
		}
	} catch (error) {
		console.error('Ошибка запроса API:', error);
	}

	// return tickers.filter((t) => SP500_TICKERS.has(t.ticker));
	return tickers;
}

async function updateTickers() {
	const client = new Client({connectionString: DB_URL});
	await client.connect();

	const tickers = await fetchTickers();
	if (tickers.length === 0) {
		console.log('Нет новых данных.');
		await client.end();
		return;
	}

	for (const ticker of tickers) {
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
				`https://assets.parqet.com/logos/symbol/${ticker.ticker}`
			],
		);
	}

	console.log(`Обновлено ${tickers.length} тикеров.`);
	await client.end();
}

export {updateTickers};
