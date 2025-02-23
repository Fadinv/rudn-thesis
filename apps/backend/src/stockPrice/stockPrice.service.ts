import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {StockPrice} from './stockPrice.entity';

@Injectable()
export class StockPriceService {
	constructor(
		@InjectRepository(StockPrice)
		private readonly stockPriceRepository: Repository<StockPrice>,
	) {}

	async getStockPrices(ticker: string, from?: number, to?: number): Promise<StockPrice[]> {
		const query = this.stockPriceRepository.createQueryBuilder('stockPrice')
			.where('stockPrice.ticker = :ticker', {ticker});

		if (from) {
			query.andWhere('stockPrice.date >= :from', {from});
		}

		if (to) {
			query.andWhere('stockPrice.date <= :to', {to});
		}

		return query.orderBy('stockPrice.date', 'ASC').getMany();
	}
}
