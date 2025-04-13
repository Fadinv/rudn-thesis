import {ObjectType, Field, Float} from '@nestjs/graphql';
import {Entity, Column, PrimaryGeneratedColumn, Index} from 'typeorm';

@ObjectType()
@Entity({name: 'stock_prices'}) // Явно указываем имя таблицы
@Index(['ticker', 'date'], {unique: true}) // ✅ Дата + тикер должны быть уникальными
export class StockPrice {
	@PrimaryGeneratedColumn()
	id!: number;

	@Field()
	@Column()
	ticker!: string; // ✅ Храним тикер как строку (без связи с Stock)

	@Field()
	@Column({type: 'date'})
	date!: string;

	@Field(() => Float)
	@Column('float')
	open!: number;

	@Field(() => Float)
	@Column('float')
	high!: number;

	@Field(() => Float)
	@Column('float')
	low!: number;

	@Field(() => Float)
	@Column('float')
	close!: number;

	@Field(() => Float)
	@Column('float')
	volume!: number;
}
