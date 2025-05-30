import {ObjectType, Field} from '@nestjs/graphql';
import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@ObjectType()
@Entity()
export class Stock {
	@Field()
	@PrimaryGeneratedColumn()
	id!: number;

	@Field()
	@Column({unique: true})
	ticker!: string;

	@Field()
	@Column()
	name!: string;

	@Field()
	@Column()
	market!: string;

	@Field()
	@Column()
	locale!: string;

	@Field()
	@Column({name: 'primary_exchange'})
	primaryExchange!: string;

	@Field({nullable: true})
	@Column({nullable: true})
	type?: string;

	@Field()
	@Column()
	active!: boolean;

	@Field()
	@Column({name: 'currency_name'})
	currencyName!: string;

	@Field({nullable: true})
	@Column({nullable: true, name: 'cik'})
	cik?: string;

	@Field({nullable: true})
	@Column({nullable: true, name: 'composite_figi'})
	compositeFigi?: string;

	@Field({nullable: true})
	@Column({nullable: true, name: 'share_class_figi'})
	shareClassFigi?: string;

	@Field()
	@Column({name: 'last_updated_utc'})
	lastUpdatedUtc!: string;

	@Field({nullable: true})
	@Column({nullable: true, name: 'logo_url'})
	logoUrl?: string;

	@Field({description: 'Источник данных'})
	@Column({default: ''})
	source!: string;

	@Field({description: 'Для отображения или уточнения биржи NASDAQ / MOEX'})
	@Column({default: ''})
	exchange!: string;

	@Field({description: 'Если true - то это индекс'})
	@Column({default: false})
	isIndex!: boolean;
}
