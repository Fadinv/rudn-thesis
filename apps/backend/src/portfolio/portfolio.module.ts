import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Stock} from '../stocks/stock.entity';
import {Portfolio} from './portfolio.entity';
import {PortfolioStock} from './portfolioStock.entity';
import {PortfolioService} from './portfolio.service';
import {PortfolioResolver} from './portfolio.resolver';
import {StocksModule} from '../stocks/stocks.module';
import {AuthModule} from '../auth/auth.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Portfolio, PortfolioStock, Stock]),
		StocksModule,
		AuthModule,
	],
	providers: [PortfolioService, PortfolioResolver],
	exports: [PortfolioService],
})
export class PortfolioModule {}
