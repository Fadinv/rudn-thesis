import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Portfolio, PortfolioStock, Stock} from '@service/orm';
import {StocksModule} from '@backend/stocks';
import {AuthModule} from '@backend/auth';
import {PortfolioResolver} from './portfolio.resolver';
import {PortfolioService} from './portfolio.service';

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
