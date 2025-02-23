import {Resolver, Query, Args, Float} from '@nestjs/graphql';
import {StockPriceService} from './stockPrice.service';
import {StockPrice} from './stockPrice.entity';

@Resolver(() => StockPrice)
export class StockPriceResolver {
	constructor(private readonly stockPriceService: StockPriceService) {}

	@Query(() => [StockPrice])
	async getStockPrices(
		@Args('ticker', {type: () => String}) ticker: string,
		@Args('from', {type: () => Float, nullable: true}) from?: number,
		@Args('to', {type: () => Float, nullable: true}) to?: number,
	): Promise<StockPrice[]> {
		return this.stockPriceService.getStockPrices(ticker, from, to);
	}
}
