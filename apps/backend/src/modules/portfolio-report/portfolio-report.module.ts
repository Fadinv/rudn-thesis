import {PortfolioReportService} from '@backend/modules/portfolio-report/application/portfolio-report.service';
import {PortfolioReportResolver} from '@backend/modules/portfolio-report/interface/portfolio-report.resolver';
import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Portfolio, PortfolioReport, PortfolioStock, StockPrice} from '@service/orm';
import {AuthModule} from '@backend/modules/auth';

@Module({
	imports: [
		TypeOrmModule.forFeature([PortfolioReport, Portfolio, StockPrice, PortfolioStock]),
		AuthModule,
	],
	providers: [PortfolioReportService, PortfolioReportResolver],
	exports: [PortfolioReportService],
})
export class PortfolioReportModule {}
