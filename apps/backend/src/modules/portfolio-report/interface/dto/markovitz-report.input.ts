import {InputType, Field, Float, Int} from '@nestjs/graphql';

@InputType()
export class MarkovitzReportInput {
	@Field(() => String, {nullable: true})
	currency?: string;

	@Field(() => [String], {nullable: true})
	additionalTickers?: string[];

	@Field(() => String, {nullable: true})
	dateRange?: string;

	@Field(() => Float, {nullable: true})
	riskFreeRate?: number;

	@Field(() => Int, {nullable: true})
	numPortfolios?: number;

	@Field(() => String, {nullable: true})
	covMethod?: string;
}
