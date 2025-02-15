import {Resolver, Mutation, Args, Query, Context} from '@nestjs/graphql';
import {UsersService} from '../users/users.service';
import {JwtAuthGuard} from './jwt-auth.guard';
import {UseGuards} from '@nestjs/common';

@Resolver()
export class AuthResolver {
	constructor(private readonly usersService: UsersService) {}

	// Регистрация пользователя
	@Mutation(() => String)
	async register(
		@Args('email') email: string,
		@Args('password') password: string,
	): Promise<string> {
		// Регистрируем пользователя и генерируем токен
		const result = await this.usersService.register(email, password);
		return result.access_token;  // Возвращаем токен
	}

	// Логин пользователя
	@Mutation(() => String)
	async login(
		@Args('email') email: string,
		@Args('password') password: string,
	): Promise<string> {
		// Логиним пользователя и генерируем токен
		const result = await this.usersService.login(email, password);
		return result.access_token;  // Возвращаем токен
	}

	// Пример защищенного запроса, доступного только для авторизованных пользователей
	@Query(() => String)
	@UseGuards(JwtAuthGuard)  // Защищаем этот запрос с помощью guard, который проверяет токен
	async protected(@Context() ctx): Promise<string> {
		return `Hello, ${ctx.user.email}`;  // ctx.user будет содержать данные из токена
	}
}
