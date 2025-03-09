import {InputType, Field, Int} from '@nestjs/graphql';

@InputType()
export class MarkovitzReportInput {
	@Field(() => [String], {nullable: true})
	additionalTickers?: string[];
}
