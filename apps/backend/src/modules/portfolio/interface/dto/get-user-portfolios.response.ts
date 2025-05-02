import {ObjectType, Field, Int} from '@nestjs/graphql';
import {Portfolio} from '@service/orm';

@ObjectType()
export class GetUserPortfoliosResponse {
	@Field(() => [Portfolio])
	items!: Portfolio[];

	@Field(() => Int)
	maxVersion!: number;

	@Field(() => Boolean)
	hasMoreData!: boolean;
}
