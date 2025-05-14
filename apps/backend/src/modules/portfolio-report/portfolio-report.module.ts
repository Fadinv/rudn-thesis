import {RmqModule} from '@backend/shared/rmq/rmq.module';
import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Portfolio, PortfolioReport, PortfolioStock, StockPrice} from '@service/orm';
import {AuthModule} from '@backend/modules/auth';
import {PortfolioReportService} from '@backend/modules/portfolio-report/application/portfolio-report.service';
import {PortfolioReportStore} from '@backend/modules/portfolio-report/infrastructure/portfolio-report.store';
import {
	PortfolioReportMemorySyncService,
} from '@backend/modules/portfolio-report/infrastructure/porttolio-report.memory-sync.service';
import {
	PortfolioReportEventsController,
} from '@backend/modules/portfolio-report/infrastructure/portfolio-report-events.controller';
import {PortfolioReportResolver} from '@backend/modules/portfolio-report/interface/portfolio-report.resolver';

@Module({
	imports: [
		TypeOrmModule.forFeature([PortfolioReport, Portfolio, StockPrice, PortfolioStock]),
		AuthModule,
		RmqModule,
	],
	providers: [
		PortfolioReportService,
		PortfolioReportResolver,
		PortfolioReportStore,
		PortfolioReportMemorySyncService,
	],
	controllers: [
		PortfolioReportEventsController,
	],
	exports: [
		PortfolioReportService,
		PortfolioReportStore,
	],
})
export class PortfolioReportModule {}
