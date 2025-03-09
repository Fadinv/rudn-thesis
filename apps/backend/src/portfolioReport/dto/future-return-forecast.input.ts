import {InputType, Field} from '@nestjs/graphql';

@InputType()
export class FutureReturnForecastInput {
	@Field(() => [Number])
	selectedPercentiles: number[]; // Набор персентилей

	@Field(() => [Number])
	forecastHorizons: number[]; // Дни
}
