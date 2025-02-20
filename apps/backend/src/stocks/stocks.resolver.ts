import {UseGuards} from '@nestjs/common';
import {Resolver, Query, Mutation, Args} from '@nestjs/graphql';
import {StockInput} from './stock.input';
import {StocksService} from './stocks.service';
import {Stock} from './stock.entity';
import {GqlAuthGuard} from '../auth/auth.guard';

@Resolver(() => Stock)
export class StocksResolver {
	constructor(private readonly stocksService: StocksService) {}

	@Query(() => [Stock])
	async getStocks(): Promise<Stock[]> {
		return this.stocksService.findAll();
	}

	@Query(() => Stock, {nullable: true})
	async getStockById(@Args('id') id: number): Promise<Stock | null> {
		return this.stocksService.findById(id);
	}

	@Query(() => Stock, {nullable: true})
	async getStockByTicker(@Args('ticker') ticker: string): Promise<Stock | null> {
		return this.stocksService.findByTicker(ticker);
	}

	@Mutation(() => Stock)
	@UseGuards(GqlAuthGuard)
	async createStock(@Args('data') data: StockInput): Promise<Stock> {
		return this.stocksService.createStock(data);
	}

	@Mutation(() => Stock)
	@UseGuards(GqlAuthGuard)
	async updateStock(
		@Args('id') id: number,
		@Args('data') data: StockInput,
	): Promise<Stock | null> {
		return this.stocksService.updateStock(id, data);
	}

	@Mutation(() => Boolean)
	@UseGuards(GqlAuthGuard)
	async deleteStock(@Args('id') id: number): Promise<boolean> {
		return this.stocksService.deleteStock(id);
	}
}
