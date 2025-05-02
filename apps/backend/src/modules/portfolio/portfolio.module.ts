import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Portfolio, PortfolioStock, Stock} from '@service/orm';
import {StocksModule} from '@backend/modules/stocks';
import {AuthModule} from '@backend/modules/auth';
import {PortfolioResolver} from '@backend/modules/portfolio/interface/portfolio.resolver';
import {PortfolioService} from '@backend/modules/portfolio/application/portfolio.service';
import {PortfolioStore} from '@backend/modules/portfolio/infrastructure/portfolio.store';
import {PortfolioMemorySyncService} from '@backend/modules/portfolio/infrastructure/portfolio.memory-sync.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([Portfolio, PortfolioStock, Stock]),
		StocksModule,
		AuthModule,
	],
	providers: [
		PortfolioService,
		PortfolioResolver,
		PortfolioStore,
		PortfolioMemorySyncService,
	],
	exports: [PortfolioService, PortfolioStore],
})
export class PortfolioModule {}
