import {InputType, Field} from '@nestjs/graphql';

@InputType()
export class StockInput {
	@Field()
	ticker: string;

	@Field()
	name: string;

	@Field()
	market: string;

	@Field()
	locale: string;

	@Field()
	primary_exchange: string;

	@Field()
	type: string;

	@Field()
	active: boolean;

	@Field()
	currency_name: string;

	@Field({nullable: true})
	cik?: string;

	@Field({nullable: true})
	composite_figi?: string;

	@Field({nullable: true})
	share_class_figi?: string;

	@Field()
	last_updated_utc: string;

	@Field({nullable: true})
	logoUrl?: string;
}
