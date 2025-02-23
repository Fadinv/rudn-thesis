import {ObjectType, Field, Int, Float} from '@nestjs/graphql';
import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm';
import {Portfolio} from './portfolio.entity';
import {Stock} from '../stocks/stock.entity';

@ObjectType()
@Entity()
export class PortfolioStock {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id: number;

	@Field(() => Portfolio)
	@ManyToOne(() => Portfolio, (portfolio) => portfolio.stocks, {onDelete: 'CASCADE'})
	portfolio: Portfolio; // К какому портфелю относится

	@Field(() => Stock)
	@ManyToOne(() => Stock)
	stock: Stock; // Какая акция в портфеле

	@Field(() => Int, { nullable: true })
	@Column('int', { nullable: true })
	quantity?: number; // Общее количество акций

	@Field(() => Float, {nullable: true})
	@Column('float', {nullable: true})
	averagePrice?: number; // Средняя цена покупки (опционально)
}
