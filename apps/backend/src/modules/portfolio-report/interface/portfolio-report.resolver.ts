import {AuthUser} from '@backend/modules/auth/domain';
import {Resolver, Query, Mutation, Args, Int, Float} from '@nestjs/graphql';
import {PortfolioReport, User} from '@service/orm';
import {MarkovitzReportInput} from '@backend/modules/portfolio-report/interface/dto/markovitz-report.input';
import {FutureReturnForecastInput} from '@backend/modules/portfolio-report/interface/dto/future-return-forecast.input';
import {PortfolioReportService} from '@backend/modules/portfolio-report/application/portfolio-report.service';
import {PortfolioDistribution} from '@backend/modules/portfolio-report/interface/dto/portfolio-distribution.response';

@Resolver(() => PortfolioReport)
export class PortfolioReportResolver {
	constructor(private readonly portfolioReportService: PortfolioReportService) {}

	// Создание отчета Марковица
	@Mutation(() => PortfolioReport)
	async createMarkovitzReport(
		@AuthUser() _user: User,
		@Args('portfolioId', {type: () => Int}) portfolioId: number,
		@Args('input') input: MarkovitzReportInput,
	): Promise<PortfolioReport> {
		return this.portfolioReportService.createMarkovitzReport(portfolioId, input);
	}

	// Создание отчета "Прогнозирование будущей доходности"
	@Mutation(() => PortfolioReport)
	async createFutureReturnForecastGBMReport(
		@AuthUser() _user: User,
		@Args('portfolioId', {type: () => Int}) portfolioId: number,
		@Args('input') input: FutureReturnForecastInput,
	): Promise<PortfolioReport> {
		return this.portfolioReportService.createFutureReturnForecastGBMReport(
			portfolioId,
			input,
		);
	}

	// Получение оптимального распределения активов в зависимости от капитала и весов
	@Query(() => PortfolioDistribution)
	async getDistributedPortfolioAssets(
		@AuthUser() _user: User,
		@Args('capital', {type: () => Float}) capital: number,
		@Args('stockTickerList', {type: () => [String]}) stockTickerList: string[],
		@Args('weights', {type: () => [Float], nullable: false}) weights: number[],
	): Promise<PortfolioDistribution> {
		return this.portfolioReportService.getDistributedPortfolioAssets(
			capital,
			stockTickerList,
			weights,
		);
	}

	// Получение отчета по ID
	@Query(() => PortfolioReport, {nullable: true})
	async getPortfolioReport(
		@AuthUser() _user: User,
		@Args('reportId') reportId: string,
	): Promise<PortfolioReport | null> {
		return this.portfolioReportService.getReport(reportId);
	}

	// Получение всех отчетов по портфелю
	@Query(() => [PortfolioReport])
	async getPortfolioReports(
		@AuthUser() _user: User,
		@Args('portfolioId', {type: () => Int}) portfolioId: number,
	): Promise<PortfolioReport[]> {
		return this.portfolioReportService.getReportsByPortfolio(portfolioId);
	}

	// Удаление отчета
	@Mutation(() => Boolean)
	async deletePortfolioReport(
		@AuthUser() _user: User,
		@Args('reportId') reportId: string,
	): Promise<boolean> {
		return this.portfolioReportService.deleteReport(reportId);
	}
}
