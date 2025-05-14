import {ObjectType, Field, Int} from '@nestjs/graphql';
import {PortfolioReport} from '@service/orm';

@ObjectType()
export class GetUserPortfolioReportsResponse {
	@Field(() => [PortfolioReport])
	items!: PortfolioReport[];

	@Field(() => Int)
	maxVersion!: number;

	@Field(() => Boolean)
	hasMoreData!: boolean;
}
