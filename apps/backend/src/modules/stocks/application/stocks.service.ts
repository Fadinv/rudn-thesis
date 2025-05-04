import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Stock} from '@service/orm';
import {Brackets, Repository} from 'typeorm';

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
	async searchStocks(search: string, includedStocks?: string[]): Promise<Stock[]> {
		const polygonTypes = ['CS', 'ETF', 'ADR', 'GDR', 'PFD'];
		const moexTypes = ['1', '2', '3', '5', '9'];

		const query = this.stockRepository.createQueryBuilder('stock')
			.where('(stock.ticker ILIKE :search OR stock.name ILIKE :search)', {search: `%${search}%`})
			.andWhere('stock.active = true')
			.andWhere('stock.isIndex = false')
			.andWhere(new Brackets(qb => {
				qb.where('(stock.market = :stocksMarket AND stock.type IN (:...polygonTypes))', {
					stocksMarket: 'stocks',
					polygonTypes,
				})
					.orWhere('(stock.market = :moexMarket AND stock.type IN (:...moexTypes))', {
						moexMarket: 'MOEX',
						moexTypes,
					});
			}));

		if (includedStocks?.length) {
			query.andWhere('stock.ticker NOT IN (:...includedStocks)', {includedStocks});
		}

		return query.take(10).getMany();
	}
}
