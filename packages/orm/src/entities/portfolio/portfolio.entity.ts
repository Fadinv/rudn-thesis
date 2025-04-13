import {ObjectType, Field, Int} from '@nestjs/graphql';
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	OneToMany,
	UpdateDateColumn,
	CreateDateColumn,
} from 'typeorm';
import {User} from '../users/user.entity';
import {PortfolioStock} from '../portfolio-stock/portfolio-stock.entity';
import {PortfolioReport} from '../portfolio-report/portfolio-report.entity';

@ObjectType()
@Entity()
export class Portfolio {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id!: number;

	@Field()
	@Column()
	name!: string; // Название портфеля

	@Field(() => User)
	@ManyToOne(() => User, (user) => user.portfolios, {onDelete: 'CASCADE'})
	user!: User; // Владелец портфеля

	@Field(() => [PortfolioStock])
	@OneToMany(() => PortfolioStock, (portfolioStock) => portfolioStock.portfolio)
	stocks!: PortfolioStock[]; // Список акций в портфеле

	@Field()
	@Column({default: false})
	isReadyForAnalysis!: boolean;

	@Field()
	@CreateDateColumn()
	createdAt!: Date; // Дата создания портфеля

	@Field()
	@UpdateDateColumn()
	updatedAt!: Date; // Дата последнего обновления портфеля

	@Field(() => [PortfolioReport])
	@OneToMany(() => PortfolioReport, (report) => report.portfolio)
	reports!: PortfolioReport[];
}
