import {UseGuards} from '@nestjs/common';
import {Resolver, Query, Mutation, Args, Int} from '@nestjs/graphql';
import {Stock} from '@service/orm';
import {GqlAuthGuard} from '@backend/auth';
import {StocksService} from './stocks.service';
import {StockInput} from './stock.input';

@Resolver(() => Stock)
export class StocksResolver {
	constructor(private readonly stocksService: StocksService) {}

	@Query(() => [Stock])
	@UseGuards(GqlAuthGuard)
	async getStocks(): Promise<Stock[]> {
		return this.stocksService.findAll();
	}

	@Query(() => Stock, {nullable: true})
	@UseGuards(GqlAuthGuard)
	async getStockById(@Args('id', {type: () => Int}) id: number): Promise<Stock | null> {
		return this.stocksService.findById(id);
	}

	@Query(() => Stock, {nullable: true})
	@UseGuards(GqlAuthGuard)
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

	@Mutation(() => Boolean)
	@UseGuards(GqlAuthGuard)
	async deleteAllStocks(): Promise<boolean> {
		return this.stocksService.deleteAllStocks();
	}

	@Query(() => [Stock])
	@UseGuards(GqlAuthGuard)
	async searchStocks(@Args('search', {type: () => String}) search: string): Promise<Stock[]> {
		return this.stocksService.searchStocks(search);
	}
}
