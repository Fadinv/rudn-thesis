import {InputType, Field} from '@nestjs/graphql';

@InputType()
export class StockInput {
	@Field()
	ticker!: string;

	@Field()
	name!: string;

	@Field()
	market!: string;

	@Field()
	locale!: string;

	@Field()
	primaryExchange!: string;

	@Field()
	type!: string;

	@Field()
	active!: boolean;

	@Field()
	currencyName!: string;

	@Field({nullable: true})
	cik?: string;

	@Field({nullable: true})
	compositeFigi?: string;

	@Field({nullable: true})
	shareClassFigi?: string;

	@Field()
	lastUpdatedUtc!: string;

	@Field({nullable: true})
	logoUrl?: string;
}
