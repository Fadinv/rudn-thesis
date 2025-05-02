import {Resolver, Mutation, Args, Context} from '@nestjs/graphql';
import {Response} from 'express';
import {CookieOptions} from 'express-serve-static-core';
import {UsersService} from '@backend/modules/users';

@Resolver()
export class AuthResolver {
	private COOKIE_MAX_AGE = 24 * 60 * 60 * 1000;
	private COOKIE_DEFAULT_OPTIONS: CookieOptions = {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
	};

	private get cookieOptions(): CookieOptions { return this.COOKIE_DEFAULT_OPTIONS; }

	constructor(private readonly usersService: UsersService) {}

	// Регистрация пользователя
	@Mutation(() => String)
	async register(
		@Args('email') email: string,
		@Args('password') password: string,
	): Promise<string> {
		const result = await this.usersService.register(email, password);
		return result.access_token;
	}

	// Логин пользователя
	@Mutation(() => String)
	async login(
		@Args('email') email: string,
		@Args('password') password: string,
		@Context('res') res: Response, // ✅ Добавляем `res`
	): Promise<string> {
		const result = await this.usersService.login(email, password);

		res.cookie('access_token', result.access_token, {
			...this.cookieOptions,
			maxAge: this.COOKIE_MAX_AGE,
		});

		return 'OK';
	}

	// Логин пользователя по токену
	@Mutation(() => String)
	async loginByToken(
		@Args('token') token: string,
		@Context('res') res: Response,
	): Promise<string> {
		const result = await this.usersService.loginByToken(token);

		res.cookie('access_token', result.access_token, {
			...this.cookieOptions,
			maxAge: this.COOKIE_MAX_AGE,
		});

		return 'OK';
	}

	// Выход пользователя (удаление токена)
	@Mutation(() => Boolean)
	async logout(@Context('res') res: Response): Promise<boolean> {
		res.clearCookie('access_token', this.cookieOptions);
		return true;
	}
}
