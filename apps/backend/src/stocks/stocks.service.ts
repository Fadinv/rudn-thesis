import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {ILike, Repository} from 'typeorm';
import {Stock} from './stock.entity';

@Injectable()
export class StocksService {
	constructor(
		@InjectRepository(Stock)
		private readonly stockRepository: Repository<Stock>,
	) {}

	async createStock(data: Partial<Stock>): Promise<Stock> {
		const stock = this.stockRepository.create(data);
		return this.stockRepository.save(stock);
	}

	async updateStock(id: number, data: Partial<Stock>): Promise<Stock | null> {
		await this.stockRepository.update(id, data);
		return this.stockRepository.findOne({where: {id}});
	}

	async deleteStock(id: number): Promise<boolean> {
		const result = await this.stockRepository.delete(id);
		return (result.affected ?? 0) > 0;
	}

	async deleteAllStocks(): Promise<boolean> {
		const result = await this.stockRepository.delete({});
		return (result.affected ?? 0) > 0;
	}

	async findAll(): Promise<Stock[]> {
		return this.stockRepository.find();
	}

	async findById(id: number): Promise<Stock | null> {
		return this.stockRepository.findOne({where: {id}});
	}

	async findByTicker(ticker: string): Promise<Stock | null> {
		return this.stockRepository.findOne({where: {ticker}});
	}

	// Поиск акций по тикеру или названию (регистр не учитывается)
	async searchStocks(search: string): Promise<Stock[]> {
		return this.stockRepository.find({
			where: [
				{ticker: ILike(`%${search}%`)},
				{name: ILike(`%${search}%`)},
			],
			take: 10, // Ограничиваем результат 10 акциями
		});
	}
}
