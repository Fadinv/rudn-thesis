import {UseGuards} from '@nestjs/common';
import {Resolver, Query, Mutation, Args, Context} from '@nestjs/graphql';
import {JwtService} from '@nestjs/jwt';
import {Request} from 'express';
import {GqlAuthGuard} from '../auth/auth.guard';
import {UsersService} from './users.service';
import {User} from './user.entity';

@Resolver(() => User)
export class UsersResolver {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
	) {}

	@Query(() => User, {nullable: true})
	async currentUser(@Context('req') req: Request): Promise<User | null> {
		const token = req.cookies?.access_token; // ✅ Читаем токен из куки
		if (!token) return null;

		try {
			const payload = this.jwtService.verify(token); // ✅ Декодируем токен
			return this.usersService.findById(payload.userId); // ✅ Ищем пользователя по ID
		} catch (err) {
			return null; // Если токен невалидный, возвращаем `null`
		}
	}

	@Query(() => [User])
	async getUsers(): Promise<User[]> {
		return this.usersService.findAll();
	}

	@Query(() => User, {nullable: true})
	async getUserById(@Args('id') id: number): Promise<User | null> {
		return this.usersService.findById(id);
	}

	@Query(() => User, {nullable: true})
	async getUserByEmail(@Args('email') email: string): Promise<User | null> {
		return this.usersService.findByEmail(email);
	}

	@Mutation(() => User)
	async createUser(
		@Args('email') email: string,
		@Args('password') password: string,
	): Promise<User> {
		return this.usersService.createUser(email, password);
	}

	@Mutation(() => User)
	async updateUser(
		@Args('id') id: number,
		@Args('email') email: string,
		@Args('password', {nullable: true}) password?: string,
	): Promise<User> {
		return this.usersService.updateUser(id, email, password);
	}

	@Mutation(() => Boolean)
	@UseGuards(GqlAuthGuard)
	async deleteUser(@Args('id') id: number, @Context('req') req): Promise<boolean> {
		return this.usersService.deleteUser(id);
	}
}
