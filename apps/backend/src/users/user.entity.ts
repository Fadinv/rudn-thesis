import {ObjectType, Field, Int} from '@nestjs/graphql';
import {Entity, PrimaryGeneratedColumn, Column, BeforeInsert} from 'typeorm';
import * as bcrypt from 'bcryptjs';

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

	@BeforeInsert()
	async hashPassword() {
		this.password = await bcrypt.hash(this.password, 10);
	}

	async validatePassword(password: string): Promise<boolean> {
		return bcrypt.compare(password, this.password);
	}
}
