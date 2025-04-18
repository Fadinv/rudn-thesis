import {DataSource} from 'typeorm';
import {baseOrmConfig} from './orm-config';
import {
	PortfolioReport,
	Stock,
	Portfolio,
	StockPrice,
	PortfolioStock,
	User,
} from './entities';

export const AppDataSource = new DataSource({
	...baseOrmConfig,
	entities: [
		PortfolioReport,
		Stock,
		Portfolio,
		StockPrice,
		PortfolioStock,
		User,
	],
});
