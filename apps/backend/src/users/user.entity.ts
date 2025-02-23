import {ObjectType, Field, Int} from '@nestjs/graphql';
import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import {Portfolio} from '../portfolio/portfolio.entity';

@ObjectType()
@Entity()
export class User {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id: number;

	@Field()
	@Column({unique: true})
	email: string;

	@Column()
	password: string;

	@Field(() => [Portfolio], {nullable: true})
	@OneToMany(() => Portfolio, (portfolio) => portfolio.user, {cascade: true})
	portfolios?: Portfolio[];

	async validatePassword(password: string): Promise<boolean> {
		return bcrypt.compare(password, this.password);
	}
}
