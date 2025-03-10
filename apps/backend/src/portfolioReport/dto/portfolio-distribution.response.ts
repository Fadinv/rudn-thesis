import {Field, Float, Int, ObjectType} from '@nestjs/graphql';

@ObjectType()
export class PortfolioDistribution {
	@Field(() => [String])
	stocks: string[];

	@Field(() => [Int])
	quantities: number[];

	@Field(() => [Float])
	averagePrices: number[];

	@Field(() => Float)
	remainingCapital: number; // Остаток капитала после покупки акций
}

