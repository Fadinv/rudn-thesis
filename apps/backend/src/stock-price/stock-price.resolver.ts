import {GqlAuthGuard} from '@backend/auth';
import {UseGuards} from '@nestjs/common';
import {Resolver, Query, Args, Float} from '@nestjs/graphql';
import {StockPrice} from '@service/orm';
import {StockPriceService} from './stock-price.service';

@Resolver(() => StockPrice)
export class StockPriceResolver {
	constructor(private readonly stockPriceService: StockPriceService) {}

	@Query(() => [StockPrice])
	@UseGuards(GqlAuthGuard)
	async getStockPrices(
		@Args('ticker', {type: () => String}) ticker: string,
		@Args('from', {type: () => Float, nullable: true}) from?: number,
		@Args('to', {type: () => Float, nullable: true}) to?: number,
	): Promise<StockPrice[]> {
		return this.stockPriceService.getStockPrices(ticker, from, to);
	}
}
