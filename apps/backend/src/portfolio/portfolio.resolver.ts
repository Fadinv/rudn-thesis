import {Resolver, Query, Mutation, Args, Int} from '@nestjs/graphql';
import {AuthUser} from '../auth/auth-user.decorator';
import {PortfolioStockUpdateInput} from './portfolio.inputs';
import {PortfolioService} from './portfolio.service';
import {Portfolio} from './portfolio.entity';
import {PortfolioStock} from './portfolioStock.entity';
import {User} from '../users/user.entity';

@Resolver(() => Portfolio)
export class PortfolioResolver {
	constructor(private readonly portfolioService: PortfolioService) {}

	@Mutation(() => Portfolio)
	async createPortfolio(@AuthUser() user: User, @Args('name') name: string): Promise<Portfolio> {
		return this.portfolioService.createPortfolio(user, name);
	}

	@Mutation(() => PortfolioStock)
	async addStockToPortfolio(
		@AuthUser() user: User,
		@Args('portfolioId', {type: () => Int}) portfolioId: number,
		@Args('stockId', {type: () => Int}) stockId: number,
		@Args('quantity', {type: () => Int}) quantity: number,
		@Args('averagePrice') averagePrice: number,
	): Promise<PortfolioStock> {
		return this.portfolioService.addStockToPortfolio(user, portfolioId, stockId, quantity, averagePrice);
	}

	@Mutation(() => PortfolioStock)
	async updatePortfolioStock(
		@AuthUser() user: User,
		@Args('portfolioStockId', {type: () => Int}) portfolioStockId: number,
		@Args('quantity', {type: () => Int, nullable: true}) quantity?: number,
		@Args('averagePrice', {nullable: true}) averagePrice?: number,
	): Promise<PortfolioStock> {
		return this.portfolioService.updatePortfolioStock(user, portfolioStockId, quantity, averagePrice);
	}

	@Mutation(() => Boolean)
	async deletePortfolioStock(
		@AuthUser() user: User,
		@Args('portfolioStockId', { type: () => Int }) portfolioStockId: number,
	): Promise<boolean> {
		return this.portfolioService.deletePortfolioStock(user, portfolioStockId);
	}


	@Mutation(() => [PortfolioStock])
	async updatePortfolioStocks(
		@AuthUser() user: User,
		@Args('updates', {type: () => [PortfolioStockUpdateInput]}) updates: PortfolioStockUpdateInput[],
	): Promise<PortfolioStock[]> {
		return this.portfolioService.updatePortfolioStocks(user, updates);
	}

	@Query(() => [Portfolio])
	async getUserPortfolios(@AuthUser() user: User): Promise<Portfolio[]> {
		return this.portfolioService.getUserPortfolios(user);
	}

	@Query(() => [PortfolioStock])
	async getPortfolioStocks(
		@AuthUser() user: User,
		@Args('portfolioId', {type: () => Int}) portfolioId: number,
	): Promise<PortfolioStock[]> {
		return this.portfolioService.getPortfolioStocks(user, portfolioId);
	}

	@Mutation(() => Boolean)
	async deletePortfolio(
		@AuthUser() user: User,
		@Args('portfolioId', {type: () => Int}) portfolioId: number,
	): Promise<boolean> {
		return this.portfolioService.deletePortfolio(user, portfolioId);
	}

	@Mutation(() => Portfolio)
	async updatePortfolio(
		@AuthUser() user: User,
		@Args('portfolioId', {type: () => Int}) portfolioId: number,
		@Args('newName') newName: string,
	): Promise<Portfolio> {
		return this.portfolioService.updatePortfolio(user, portfolioId, newName);
	}
}
