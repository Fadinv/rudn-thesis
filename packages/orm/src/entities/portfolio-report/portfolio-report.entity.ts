import {ObjectType, Field, Int} from '@nestjs/graphql';
import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne} from 'typeorm';
import {GraphQLJSON} from 'graphql-type-json';
import {Portfolio} from '../portfolio/portfolio.entity';

@ObjectType()
@Entity({name: 'portfolio_reports'})
export class PortfolioReport {
	@Field({description: 'Уникальный идентификатор отчета'})
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Field(() => Int)
	@Column({type: 'int', default: 1})
	version!: number;

	@Field(() => Boolean)
	@Column({type: 'boolean', default: false})
	deleted!: boolean;

	@Field(() => Portfolio, {description: 'Связь с портфелем'})
	@ManyToOne(() => Portfolio, (portfolio) => portfolio.reports, {onDelete: 'CASCADE'})
	portfolio!: Portfolio;

	@Field()
	@Column({type: 'text'})
	reportType!: 'markowitz' | 'future_returns_forecast_gbm' | 'value_at_risk'; // Тип отчета

	@Field(
		() => GraphQLJSON, {nullable: true, description: 'JSON с входными данными'})
	@Column({type: 'jsonb', nullable: true})
	inputParams?: any;

	@Field(() => GraphQLJSON, {nullable: true, description: 'JSON с расчетами'})
	@Column({type: 'jsonb', nullable: true})
	data?: any;

	@Field({description: 'Статус отчета'})
	@Column({type: 'text', default: 'calculating'})
	status!: 'calculating' | 'ready' | 'error';

	@Field({nullable: true, description: 'Описание ошибки, если status = "error"'})
	@Column({type: 'text', nullable: true})
	errorMessage?: string;

	@Field({description: 'Дата создания'})
	@CreateDateColumn()
	createdAt!: Date;

	@Field({description: 'Дата обновления'})
	@UpdateDateColumn()
	updatedAt!: Date;
}
