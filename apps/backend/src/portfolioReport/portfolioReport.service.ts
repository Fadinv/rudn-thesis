import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {PortfolioStock} from '../portfolio/portfolioStock.entity';
import {StockPrice} from '../stockPrice/stockPrice.entity';
import {PortfolioReport} from './portfolioReport.entity';
import {Portfolio} from '../portfolio/portfolio.entity';
import axios from 'axios';

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

	// Создать отчет с изначальным статусом "calculating"
	async createReport(portfolioId: number, reportType: 'markowitz' | 'growth_forecast' | 'value_at_risk', additionalTickers: string[] = []): Promise<PortfolioReport> {
		const portfolio = await this.portfolioRepository.findOne({where: {id: portfolioId}});
		if (!portfolio) throw new Error('Портфель не найден');

		const report = this.reportRepository.create({
			portfolio,
			reportType,
			status: 'calculating',
		});

		const savedReport = await this.reportRepository.save(report);

		// Запускаем анализ асинхронно
		this.analyzePortfolio(savedReport.id, additionalTickers).catch(async (error) => {
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

	async analyzePortfolio(reportId: string, additionalTickers: string[] = []): Promise<void> {
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

		if (portfolioStocks.length === 0 && additionalTickers.length === 0) {
			await this.reportRepository.update(reportId, {
				status: 'error',
				errorMessage: 'No stocks in portfolio or additional stocks',
			});
			return;
		}

		console.log(`📡 Отправляем запрос в Python для отчёта ${reportId}`);
		const ANALYZER_URL = process.env.ANALYZER_URL || 'http://analyzer:8001';

		try {
			await axios.post(`${ANALYZER_URL}/optimize`, { reportId });
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
