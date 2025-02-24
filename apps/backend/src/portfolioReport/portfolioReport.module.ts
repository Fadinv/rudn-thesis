import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {PortfolioStock} from '../portfolio/portfolioStock.entity';
import {StockPrice} from '../stockPrice/stockPrice.entity';
import {PortfolioReport} from './portfolioReport.entity';
import {PortfolioReportService} from './portfolioReport.service';
import {PortfolioReportResolver} from './portfolioReport.resolver';
import {Portfolio} from '../portfolio/portfolio.entity';

@Module({
	imports: [TypeOrmModule.forFeature([PortfolioReport, Portfolio, StockPrice, PortfolioStock])],
	providers: [PortfolioReportService, PortfolioReportResolver],
	exports: [PortfolioReportService],
})
export class PortfolioReportModule {}
