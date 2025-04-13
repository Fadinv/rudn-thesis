import {Field, Float, InputType, Int} from '@nestjs/graphql';

@InputType()
export class StocksWhileCreatingPortfolio {
	@Field(() => String)
	stockTicker!: string;

	@Field(() => Int)
	quantity!: number;

	@Field(() => Float)
	averagePrice!: number;
}

