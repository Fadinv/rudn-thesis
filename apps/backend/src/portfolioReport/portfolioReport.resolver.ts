import {Resolver, Query, Mutation, Args} from '@nestjs/graphql';
import {PortfolioReportService} from './portfolioReport.service';
import {PortfolioReport} from './portfolioReport.entity';

@Resolver(() => PortfolioReport)
export class PortfolioReportResolver {
	constructor(private readonly portfolioReportService: PortfolioReportService) {}

	// 🔹 Создание отчета
	@Mutation(() => PortfolioReport)
	async createPortfolioReport(
		@Args('portfolioId') portfolioId: number,
		@Args('reportType') reportType: 'markowitz' | 'growth_forecast' | 'value_at_risk',
	): Promise<PortfolioReport> {
		return this.portfolioReportService.createReport(portfolioId, reportType);
	}

	// 🔹 Получение отчета по ID
	@Query(() => PortfolioReport, {nullable: true})
	async getPortfolioReport(@Args('reportId') reportId: string): Promise<PortfolioReport | null> {
		return this.portfolioReportService.getReport(reportId);
	}

	// 🔹 Получение всех отчетов по портфелю
	@Query(() => [PortfolioReport])
	async getPortfolioReports(@Args('portfolioId') portfolioId: number): Promise<PortfolioReport[]> {
		return this.portfolioReportService.getReportsByPortfolio(portfolioId);
	}
}
