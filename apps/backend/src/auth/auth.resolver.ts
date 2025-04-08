import {Resolver, Mutation, Args, Query, Context} from '@nestjs/graphql';
import {Response} from 'express';
import {UsersService} from '../users/users.service';

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
		@Context('res') res: Response, // ✅ Добавляем `res`
	): Promise<string> {
		// Логиним пользователя и генерируем токен
		const result = await this.usersService.login(email, password);
		// ✅ Устанавливаем accessToken в `HttpOnly` cookie
		res.cookie('access_token', result.access_token, {
			httpOnly: true,  // ✅ Доступен только серверу
			secure: process.env.NODE_ENV === 'production', // ✅ Только HTTPS в продакшене
			sameSite: 'none',
			maxAge: 60 * 60 * 1000, // ✅ 1 час
		});
		return result.access_token;  // Возвращаем токен
	}

	// Выход пользователя (удаление токена)
	@Mutation(() => Boolean)
	async logout(@Context('res') res: Response): Promise<boolean> {
		res.clearCookie('access_token', {
			httpOnly: true,  // ✅ Доступен только серверу
			secure: process.env.NODE_ENV === 'production', // ✅ Только HTTPS в продакшене
			sameSite: 'none',
		});
		return true; // ✅ Успешный выход
	}

}
