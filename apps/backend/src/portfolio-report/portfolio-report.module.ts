import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Portfolio, PortfolioReport, PortfolioStock, StockPrice} from '@service/orm';
import {PortfolioReportService, PortfolioReportResolver} from '@backend/portfolio-report';
import {AuthModule} from '@backend/auth';

@Module({
	imports: [
		TypeOrmModule.forFeature([PortfolioReport, Portfolio, StockPrice, PortfolioStock]),
		AuthModule,
	],
	providers: [PortfolioReportService, PortfolioReportResolver],
	exports: [PortfolioReportService],
})
export class PortfolioReportModule {}
