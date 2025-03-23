import {Injectable} from '@nestjs/common';
import {Field, Float, Int} from '@nestjs/graphql';
import {InjectRepository} from '@nestjs/typeorm';
import {FutureReturnForecastInput} from 'src/portfolioReport/dto/future-return-forecast.input';
import {MarkovitzReportInput} from 'src/portfolioReport/dto/markovitz-report.input';
import {Repository} from 'typeorm';
import {PortfolioStock} from '../portfolio/portfolioStock.entity';
import {StockPrice} from '../stockPrice/stockPrice.entity';
import {PortfolioReport} from './portfolioReport.entity';
import {Portfolio} from '../portfolio/portfolio.entity';
import axios from 'axios';

export type ReportType = 'markowitz' | 'future_returns_forecast_gbm' | 'value_at_risk';

@Injectable()
export class PortfolioReportService {
	private ANALYZER_URL = process.env.ANALYZER_URL || 'http://analyzer:8001';

	constructor(
		@InjectRepository(PortfolioReport)
		private readonly reportRepository: Repository<PortfolioReport>,
		@InjectRepository(Portfolio)
		private readonly portfolioRepository: Repository<Portfolio>,
		@InjectRepository(StockPrice)
		private readonly stockPriceRepository: Repository<StockPrice>,
		@InjectRepository(PortfolioStock)
		private readonly portfolioStockRepository: Repository<PortfolioStock>,
	) {}


	private _supportedReports: Partial<Record<ReportType, boolean>> = {
		'markowitz': true,
		'future_returns_forecast_gbm': true,
	};

	async createDefaultReport(
		portfolioId: number,
		reportType: ReportType,
	) {
		if (!this._supportedReports[reportType]) {
			throw new Error(`Данный тип анализа не поддерживается (reportType: ${reportType})`);
		}

		const portfolio = await this.portfolioRepository.findOne({where: {id: portfolioId}});
		if (!portfolio) throw new Error('Портфель не найден');

		const report = this.reportRepository.create({
			portfolio,
			reportType,
			status: 'calculating',
		});

		const savedReport = await this.reportRepository.save(report);

		if (!savedReport) throw new Error(`Ошибка при создании портфеля (reportType: "markowitz"`);

		return savedReport;
	}

	// Создать отчет с изначальным статусом "calculating"
	async createMarkovitzReport(portfolioId: number, input: MarkovitzReportInput): Promise<PortfolioReport> {
		const savedReport = await this.createDefaultReport(portfolioId, 'markowitz');

		this.analyzeMarkovitzPortfolio(savedReport.id, input).catch(async (error) => {
			console.error('Ошибка при анализе портфеля:', error);
			await this.reportRepository.update(savedReport.id, {
				status: 'error',
				errorMessage: 'Ошибка при анализе портфеля',
			});
		});

		return savedReport;
	}

	// Создать отчет с изначальным статусом "calculating"
	async createFutureReturnForecastGBMReport(portfolioId: number, input: FutureReturnForecastInput): Promise<PortfolioReport> {
		const savedReport = await this.createDefaultReport(portfolioId, 'future_returns_forecast_gbm');

		this.analyzeFutureReturnsForecastGBM(savedReport.id, input).catch(async (error) => {
			console.error('Ошибка при анализе портфеля:', error);
			await this.reportRepository.update(savedReport.id, {
				status: 'error',
				errorMessage: 'Ошибка при анализе портфеля',
			});
		});

		return savedReport;
	}

	// Обновить отчет (данные + статус)
	async updateReport(reportId: string, data: any, status: 'ready' | 'error', errorMessage?: string): Promise<PortfolioReport> {
		const report = await this.reportRepository.findOne({where: {id: reportId}});
		if (!report) throw new Error('Отчет не найден');

		report.data = status === 'ready' ? data : null;
		report.status = status;
		report.errorMessage = errorMessage;

		return this.reportRepository.save(report);
	}

	// Получить все отчеты по портфелю
	async getReportsByPortfolio(portfolioId: number): Promise<PortfolioReport[]> {
		return this.reportRepository.find({
			where: {portfolio: {id: portfolioId}},
			order: {createdAt: 'DESC'},
		});
	}

	// Получить конкретный отчет
	async getReport(reportId: string): Promise<PortfolioReport | null> {
		return this.reportRepository.findOne({where: {id: reportId}});
	}

	async deleteReport(reportId: string): Promise<boolean> {
		const report = await this.reportRepository.findOne({where: {id: reportId}});
		if (!report) return false;
		await this.reportRepository.remove(report);
		return true;
	}

	async getDistributedPortfolioAssets(
		capital: number,
		stockTickerList: string[],
		weights: number[],
	) {
		try {
			// Формируем объект запроса
			const requestData = {
				capital,
				prices: {},
				weights: {},
			};

			// Заполняем данные цен и весов
			for (let i = 0; i < stockTickerList.length; i++) {
				const stockTicker = stockTickerList[i];

				// Получаем текущую цену акции
				const stockPriceEntity = await this.stockPriceRepository.findOne({
					where: {ticker: stockTicker},
					order: {date: 'DESC'}, // Берем последнюю цену
				});

				if (!stockPriceEntity) {
					throw new Error(`Цена для акции ${stockTicker} не найдена`);
				}

				// Заполняем данные
				requestData.prices[stockTicker] = stockPriceEntity.close;
				requestData.weights[stockTicker] = weights[i];
			}

			// Отправляем запрос в Python
			const response = await axios.post(`${this.ANALYZER_URL}/allocate_assets`, requestData);

			const remainingCapital = response.data.allocation[1];
			const data: {
				stocks: string[];
				quantities: number[];
				averagePrices: number[];
				remainingCapital: number; // Остаток капитала после покупки акций
			} = {
				stocks: [],
				averagePrices: [],
				quantities: [],
				remainingCapital,
			};
			const stocks = response.data.allocation[0];

			Object.keys(stocks).forEach((key) => {
				data.stocks.push(key);
				data.quantities.push(stocks[key].quantity);
				data.averagePrices.push(stocks[key].price);
			});

			// Возвращаем результат
			return data;
		} catch (error) {
			console.error('❌ Ошибка при распределении активов:', error);
			throw new Error('Ошибка при распределении активов');
		}
	}

	async analyzeMarkovitzPortfolio(reportId: string, input: MarkovitzReportInput): Promise<void> {
		const report = await this.reportRepository.findOne({
			where: {id: reportId},
			relations: ['portfolio'],
		});

		if (!report || !report.portfolio) {
			await this.reportRepository.update(reportId, {
				status: 'error',
				errorMessage: 'Portfolio not found',
			});
			return;
		}

		const portfolioId = report.portfolio.id;

		// Получаем акции портфеля
		const portfolioStocks = await this.portfolioStockRepository.find({
			where: {portfolio: {id: portfolioId}},
			relations: ['stock'],
		});

		if (portfolioStocks.length === 0 && input.additionalTickers?.length === 0) {
			await this.reportRepository.update(reportId, {
				status: 'error',
				errorMessage: 'No stocks in portfolio or additional stocks',
			});
			return;
		}

		console.log(`📡 Отправляем запрос в Python для отчёта ${reportId}`);

		try {
			await axios.post(`${this.ANALYZER_URL}/markovitz`, {
				reportId,
				additionalTickers: input?.additionalTickers || [],
				date_range: input?.dateRange,
				risk_free_rate: input?.riskFreeRate,
				num_portfolios: input?.numPortfolios,
				cov_method: input?.covMethod,
			});
			console.log(`✅ Python принял отчёт ${reportId}, ожидаем расчёта`);
		} catch (error) {
			console.error('❌ Ошибка при отправке в Python:', error);
			await this.reportRepository.update(reportId, {
				status: 'error',
				errorMessage: 'Ошибка при вызове Python-сервиса',
			});
		}
	}

	async analyzeFutureReturnsForecastGBM(reportId: string, input: FutureReturnForecastInput): Promise<void> {
		console.log(`📡 Отправляем запрос в Python для отчёта ${reportId}`);

		try {
			await axios.post(`${this.ANALYZER_URL}/future_value_gbm`, {
				reportId,
				selectedPercentiles: input.selectedPercentiles,
				forecastHorizons: input.forecastHorizons,
				date_range: input?.dateRange,
			});
			console.log(`✅ Python принял отчёт ${reportId}, ожидаем расчёта`);
		} catch (error) {
			console.error('❌ Ошибка при отправке в Python:', error);
			await this.reportRepository.update(reportId, {
				status: 'error',
				errorMessage: 'Ошибка при вызове Python-сервиса',
			});
		}
	}
}
