import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {PortfolioStock} from '../portfolio/portfolioStock.entity';
import {StockPrice} from '../stockPrice/stockPrice.entity';
import {PortfolioReport} from './portfolioReport.entity';
import {Portfolio} from '../portfolio/portfolio.entity';

@Injectable()
export class PortfolioReportService {
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

	// 🔹 Создать отчет с изначальным статусом "calculating"
	async createReport(portfolioId: number, reportType: 'markowitz' | 'growth_forecast' | 'value_at_risk'): Promise<PortfolioReport> {
		const portfolio = await this.portfolioRepository.findOne({where: {id: portfolioId}});
		if (!portfolio) throw new Error('Портфель не найден');

		const report = this.reportRepository.create({
			portfolio,
			reportType,
			status: 'calculating',
		});

		const savedReport = await this.reportRepository.save(report);

		// Запускаем анализ асинхронно
		this.analyzePortfolio(savedReport.id).catch(async (error) => {
			console.error('Ошибка при анализе портфеля:', error);
			await this.reportRepository.update(savedReport.id, {
				status: 'error',
				errorMessage: 'Ошибка при анализе портфеля',
			});
		});

		return savedReport;
	}

	// 🔹 Обновить отчет (данные + статус)
	async updateReport(reportId: string, data: any, status: 'ready' | 'error', errorMessage?: string): Promise<PortfolioReport> {
		const report = await this.reportRepository.findOne({where: {id: reportId}});
		if (!report) throw new Error('Отчет не найден');

		report.data = status === 'ready' ? data : null;
		report.status = status;
		report.errorMessage = errorMessage;

		return this.reportRepository.save(report);
	}

	// 🔹 Получить все отчеты по портфелю
	async getReportsByPortfolio(portfolioId: number): Promise<PortfolioReport[]> {
		return this.reportRepository.find({
			where: {portfolio: {id: portfolioId}},
			order: {createdAt: 'DESC'},
		});
	}

	// 🔹 Получить конкретный отчет
	async getReport(reportId: string): Promise<PortfolioReport | null> {
		return this.reportRepository.findOne({where: {id: reportId}});
	}

	async analyzePortfolio(reportId: string): Promise<void> {
		const report = await this.reportRepository.findOne({
			where: {id: reportId},
			relations: ['portfolio'], // Загружаем взаимосвязь с портфелем
		});

		if (!report || !report.portfolio) {
			await this.reportRepository.update(reportId, {
				status: 'error',
				errorMessage: 'Portfolio not found',
			});
			return;
		}

		const portfolioId = report.portfolio.id;

		// Получаем список акций в портфеле
		const portfolioStocks = await this.portfolioStockRepository.find({
			where: {portfolio: {id: portfolioId}},
			relations: ['stock'], // Загружаем связь с акциями
		});

		if (portfolioStocks.length === 0) {
			await this.reportRepository.update(reportId, {
				status: 'error',
				errorMessage: 'No stocks in portfolio',
			});
			return;
		}

		const tickers = portfolioStocks.map(stock => stock.stock.ticker);

		// Получаем котировки за последние 3 года
		const stockPrices = await this.stockPriceRepository
			.createQueryBuilder('stock_price')
			.where('stock_price.ticker IN (:...tickers)', {tickers})
			.andWhere('stock_price.date >= NOW() - INTERVAL \'3 years\'')
			.orderBy('stock_price.date', 'ASC')
			.getMany();

		if (stockPrices.length === 0) {
			await this.reportRepository.update(reportId, {
				status: 'error',
				errorMessage: 'No stock price data available',
			});
			return;
		}

		// Рассчитываем показатели
		const analysisResult = this.calculateMarkowitzPortfolio(stockPrices, portfolioStocks);

		// Обновляем отчет
		await this.reportRepository.update(reportId, {
			status: 'ready',
			data: analysisResult,
			updatedAt: new Date(),
		});
	}

	private calculateMarkowitzPortfolio(stockPrices: StockPrice[], portfolioStocks: PortfolioStock[]) {
		// 🔢 Тут будет расчет модели Марковица (доходность, ковариация, оптимальный портфель)
		// Временная заглушка:
		return {
			meanReturns: {},
			covarianceMatrix: {},
			optimalWeights: {},
			efficientFrontier: {},
		};
	}
}
