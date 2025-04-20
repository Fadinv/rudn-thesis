import {AppDataSource, Stock} from '@service/orm';

export async function createUsdRubTicker() {
	const stockRepo = AppDataSource.getRepository(Stock);

	const usdRub = stockRepo.create({
		ticker: 'C:USDRUB',
		name: 'United States dollar - Russian rouble',
		market: 'fx',
		locale: 'global',
		primaryExchange: 'FOREX',
		type: 'currency_pair',
		active: true,
		currencyName: 'Russian rouble',
		cik: '',
		compositeFigi: '',
		shareClassFigi: '',
		lastUpdatedUtc: new Date().toISOString(),
		logoUrl: '',
		source: 'polygon',
		exchange: 'FX',
		isIndex: false,
	});

	await stockRepo.upsert(usdRub, ['ticker']);
	console.log('✅ Тикер C:USDRUB добавлен или обновлён');

	return usdRub;
}
