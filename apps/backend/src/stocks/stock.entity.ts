import {ObjectType, Field} from '@nestjs/graphql';
import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@ObjectType()
@Entity()
export class Stock {
	@Field()
	@PrimaryGeneratedColumn()
	id: number;

	@Field()
	@Column({unique: true})
	ticker: string;

	@Field()
	@Column()
	name: string;

	@Field()
	@Column()
	market: string;

	@Field()
	@Column()
	locale: string;

	@Field()
	@Column()
	primary_exchange: string;

	@Field()
	@Column()
	type: string;

	@Field()
	@Column()
	active: boolean;

	@Field()
	@Column()
	currency_name: string;

	@Field({nullable: true})
	@Column({nullable: true})
	cik: string;

	@Field({nullable: true})
	@Column({nullable: true})
	composite_figi: string;

	@Field({nullable: true})
	@Column({nullable: true})
	share_class_figi: string;

	@Field()
	@Column()
	last_updated_utc: string;

	@Field({nullable: true})
	@Column({nullable: true})
	logoUrl: string;
}
