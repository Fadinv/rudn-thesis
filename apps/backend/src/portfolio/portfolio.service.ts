import {Injectable, NotFoundException, ForbiddenException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Portfolio} from './portfolio.entity';
import {PortfolioStockUpdateInput} from './portfolio.inputs';
import {PortfolioStock} from './portfolioStock.entity';
import {User} from '../users/user.entity';
import {Stock} from '../stocks/stock.entity';

@Injectable()
export class PortfolioService {
	constructor(
		@InjectRepository(Portfolio)
		private readonly portfolioRepository: Repository<Portfolio>,
		@InjectRepository(PortfolioStock)
		private readonly portfolioStockRepository: Repository<PortfolioStock>,
		@InjectRepository(Stock)
		private readonly stockRepository: Repository<Stock>,
	) {}

	// Создание портфеля
	async createPortfolio(user: User, name: string): Promise<Portfolio> {
		const portfolio = this.portfolioRepository.create({name, user});
		return this.portfolioRepository.save(portfolio);
	}

	// Добавление акции в портфель (сразу передаем среднюю цену)
	async addStockToPortfolio(
		user: User,
		portfolioId: number,
		stockId: number,
		quantity?: number,
		averagePrice?: number,
	): Promise<PortfolioStock> {
		const portfolio = await this.portfolioRepository.findOne({
			where: {id: portfolioId, user},
		});

		if (!portfolio) throw new ForbiddenException('Портфель не найден');

		const stock = await this.stockRepository.findOne({where: {id: stockId}});

		if (!stock) throw new NotFoundException('Акция не найдена');

		// Всегда создаем новую запись, даже если такая акция уже есть
		const portfolioStock = this.portfolioStockRepository.create({
			portfolio,
			stock,
			quantity,
			averagePrice,
		});

		await this.portfolioStockRepository.save(portfolioStock);
		// Пересчитываем `isReadyForAnalysis`
		await this.updatePortfolioAnalysisStatus(portfolioId);

		return portfolioStock;
	}

	// Обновление акции в портфеле (например, изменение количества или средней цены)
	async updatePortfolioStock(
		user: User,
		portfolioStockId: number,
		quantity?: number,
		averagePrice?: number,
	): Promise<PortfolioStock> {
		const portfolioStock = await this.portfolioStockRepository.findOne({
			where: {id: portfolioStockId, portfolio: {user}},
		});

		if (!portfolioStock) throw new NotFoundException('Акция в портфеле не найдена');

		if (quantity !== undefined) {
			portfolioStock.quantity = quantity;
		}
		if (averagePrice !== undefined) {
			portfolioStock.averagePrice = averagePrice;
		}

		await this.portfolioStockRepository.save(portfolioStock);

		// Пересчитываем `isReadyForAnalysis`
		await this.updatePortfolioAnalysisStatus(portfolioStock.portfolio.id);

		return portfolioStock;
	}

	async deletePortfolioStock(user: User, portfolioStockId: number): Promise<boolean> {
		const portfolioStock = await this.portfolioStockRepository.findOne({
			where: {id: portfolioStockId},
			// relations: ['portfolio', 'portfolio.user'],
			relations: ['portfolio'],
		});

		if (!portfolioStock) {
			throw new NotFoundException('Акция в портфеле не найдена');
		}

		console.log('portfolioStock.portfolio', portfolioStock.portfolio);
		if (portfolioStock.portfolio.user.id !== user.id) {
			throw new ForbiddenException('Вы не владеете этим портфелем');
		}

		await this.portfolioStockRepository.remove(portfolioStock);

		// Пересчитываем `isReadyForAnalysis`
		await this.updatePortfolioAnalysisStatus(portfolioStock.portfolio.id);

		return true;
	}

	// Обновление акций в портфеле
	async updatePortfolioStocks(
		user: User,
		updates: PortfolioStockUpdateInput[],
	): Promise<PortfolioStock[]> {
		const updatedStocks: PortfolioStock[] = [];

		for (const update of updates) {
			const portfolioStock = await this.portfolioStockRepository.findOne({
				where: {id: update.portfolioStockId, portfolio: {user}},
			});

			if (!portfolioStock) throw new NotFoundException(`Акция в портфеле не найдена (ID: ${update.portfolioStockId})`);

			if (update.quantity !== undefined) {
				portfolioStock.quantity = update.quantity;
			}
			if (update.averagePrice !== undefined) {
				portfolioStock.averagePrice = update.averagePrice;
			}

			updatedStocks.push(await this.portfolioStockRepository.save(portfolioStock));
		}

		return updatedStocks;
	}

	// Получение всех портфелей пользователя (без акций)
	async getUserPortfolios(user: User): Promise<Portfolio[]> {
		return this.portfolioRepository.find({where: {user}});
	}

	// Получение всех акций портфеля
	async getPortfolioStocks(user: User, portfolioId: number): Promise<PortfolioStock[]> {
		const portfolio = await this.portfolioRepository.findOne({where: {id: portfolioId, user}});
		if (!portfolio) throw new ForbiddenException('Портфель не найден');

		return this.portfolioStockRepository.find({where: {portfolio: {id: portfolioId}}, relations: ['stock']});
	}

	// Удаление портфеля
	async deletePortfolio(user: User, portfolioId: number): Promise<boolean> {
		const portfolio = await this.portfolioRepository.findOne({where: {id: portfolioId, user}});
		if (!portfolio) throw new ForbiddenException('Портфель не найден');

		await this.portfolioRepository.remove(portfolio);
		return true;
	}

	// Редактирование портфеля (пока только имя)
	async updatePortfolio(user: User, portfolioId: number, newName: string): Promise<Portfolio> {
		const portfolio = await this.portfolioRepository.findOne({where: {id: portfolioId, user}});
		if (!portfolio) throw new ForbiddenException('Портфель не найден');

		portfolio.name = newName;
		return this.portfolioRepository.save(portfolio);
	}

	// Удаление одной акции из портфеля
	async removeStockFromPortfolio(user: User, portfolioStockId: number): Promise<boolean> {
		const portfolioStock = await this.portfolioStockRepository.findOne({
			where: {id: portfolioStockId, portfolio: {user: {id: user.id}}},
		});

		if (!portfolioStock) throw new NotFoundException('Акция не найдена в портфеле');

		await this.portfolioStockRepository.remove(portfolioStock);
		return true;
	}

	// Удаление всех акций из портфеля (чистка)
	async clearPortfolio(user: User, portfolioId: number): Promise<boolean> {
		const portfolio = await this.portfolioRepository.findOne({where: {id: portfolioId, user}});
		if (!portfolio) throw new NotFoundException('Портфель не найден');

		await this.portfolioStockRepository.delete({portfolio});
		return true;
	}

	// Функция для пересчета isReadyForAnalysis
	async updatePortfolioAnalysisStatus(portfolioId: number): Promise<void> {
		const portfolio = await this.portfolioRepository.findOne({
			where: {id: portfolioId},
			relations: ['stocks'], // Загружаем акции в портфеле
		});

		if (!portfolio) return;

		// Проверяем, есть ли акции без количества или средней цены
		const allStocksValid = portfolio.stocks.every(stock => !!stock.quantity && stock.averagePrice !== null);

		// Обновляем флаг
		if (portfolio.isReadyForAnalysis !== allStocksValid) {
			portfolio.isReadyForAnalysis = allStocksValid;
			await this.portfolioRepository.save(portfolio);
		}
	}

}
