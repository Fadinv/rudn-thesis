import {ObjectType, Field} from '@nestjs/graphql';
import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne} from 'typeorm';
import {Portfolio} from '../portfolio/portfolio.entity';
import {GraphQLJSON} from 'graphql-type-json';

@ObjectType()
@Entity({name: 'portfolio_reports'})
export class PortfolioReport {
	@Field()
	@PrimaryGeneratedColumn('uuid')
	id: string; // 🔹 Уникальный идентификатор отчета

	@Field(() => Portfolio)
	@ManyToOne(() => Portfolio, (portfolio) => portfolio.reports, {onDelete: 'CASCADE'})
	portfolio: Portfolio; // Связь с портфелем

	@Field()
	@Column({type: 'text'})
	reportType: 'markowitz' | 'growth_forecast' | 'value_at_risk'; // Тип отчета

	@Field(() => GraphQLJSON, {nullable: true})
	@Column({type: 'jsonb', nullable: true})
	data?: any; // JSON с расчетами

	@Field()
	@Column({type: 'text', default: 'calculating'})
	status: 'calculating' | 'ready' | 'error'; // Статус отчета

	@Field({nullable: true})
	@Column({type: 'text', nullable: true})
	errorMessage?: string; // Описание ошибки, если status = "error"

	@Field()
	@CreateDateColumn()
	createdAt: Date; // Дата создания

	@Field()
	@UpdateDateColumn()
	updatedAt: Date; // Дата обновления
}
