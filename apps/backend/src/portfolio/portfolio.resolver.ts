import {Resolver, Query, Mutation, Args, Int} from '@nestjs/graphql';
import {PortfolioStockUpdateInput} from './portfolio.inputs';
import {PortfolioService} from './portfolio.service';
import {Portfolio} from './portfolio.entity';
import {PortfolioStock} from './portfolioStock.entity';
import {UseGuards} from '@nestjs/common';
import {GqlAuthGuard} from '../auth/auth.guard';
import {CurrentUser} from '../auth/current-user.decorator';
import {User} from '../users/user.entity';

@Resolver(() => Portfolio)
export class PortfolioResolver {
	constructor(private readonly portfolioService: PortfolioService) {}

	@Mutation(() => Portfolio)
	@UseGuards(GqlAuthGuard)
	async createPortfolio(@CurrentUser() user: User, @Args('name') name: string): Promise<Portfolio> {
		return this.portfolioService.createPortfolio(user, name);
	}

	@Mutation(() => PortfolioStock)
	@UseGuards(GqlAuthGuard)
	async addStockToPortfolio(
		@CurrentUser() user: User,
		@Args('portfolioId', {type: () => Int}) portfolioId: number,
		@Args('stockId', {type: () => Int}) stockId: number,
		@Args('quantity') quantity: number,
		@Args('averagePrice') averagePrice: number,
	): Promise<PortfolioStock> {
		return this.portfolioService.addStockToPortfolio(user, portfolioId, stockId, quantity, averagePrice);
	}

	@Mutation(() => PortfolioStock)
	@UseGuards(GqlAuthGuard)
	async updatePortfolioStock(
		@CurrentUser() user: User,
		@Args('portfolioStockId', {type: () => Int}) portfolioStockId: number,
		@Args('quantity') quantity: number,
		@Args('averagePrice') averagePrice: number,
	): Promise<PortfolioStock> {
		return this.portfolioService.updatePortfolioStock(user, portfolioStockId, quantity, averagePrice);
	}

	@Mutation(() => [PortfolioStock])
	@UseGuards(GqlAuthGuard)
	async updatePortfolioStocks(
		@CurrentUser() user: User,
		@Args('updates', {type: () => [PortfolioStockUpdateInput]}) updates: PortfolioStockUpdateInput[],
	): Promise<PortfolioStock[]> {
		return this.portfolioService.updatePortfolioStocks(user, updates);
	}

	@Query(() => [Portfolio])
	@UseGuards(GqlAuthGuard)
	async getUserPortfolios(@CurrentUser() user: User): Promise<Portfolio[]> {
		return this.portfolioService.getUserPortfolios(user);
	}

	@Query(() => [PortfolioStock])
	@UseGuards(GqlAuthGuard)
	async getPortfolioStocks(
		@CurrentUser() user: User,
		@Args('portfolioId', {type: () => Int}) portfolioId: number,
	): Promise<PortfolioStock[]> {
		return this.portfolioService.getPortfolioStocks(user, portfolioId);
	}

	@Mutation(() => Boolean)
	@UseGuards(GqlAuthGuard)
	async deletePortfolio(
		@CurrentUser() user: User,
		@Args('portfolioId', {type: () => Int}) portfolioId: number,
	): Promise<boolean> {
		return this.portfolioService.deletePortfolio(user, portfolioId);
	}

	@Mutation(() => Portfolio)
	@UseGuards(GqlAuthGuard)
	async updatePortfolio(
		@CurrentUser() user: User,
		@Args('portfolioId', {type: () => Int}) portfolioId: number,
		@Args('newName') newName: string,
	): Promise<Portfolio> {
		return this.portfolioService.updatePortfolio(user, portfolioId, newName);
	}
}
