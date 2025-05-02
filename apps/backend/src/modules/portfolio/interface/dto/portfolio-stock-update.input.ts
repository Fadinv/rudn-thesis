import {InputType, Field, Int, Float} from '@nestjs/graphql';

@InputType()
export class PortfolioStockUpdateInput {
	@Field(() => Int)
	portfolioStockId!: number;

	@Field(() => Int, {nullable: true})
	quantity?: number;

	@Field(() => Float, {nullable: true})
	averagePrice?: number;
}
