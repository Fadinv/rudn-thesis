import {createParamDecorator, ExecutionContext, UnauthorizedException} from '@nestjs/common';
import {GqlExecutionContext} from '@nestjs/graphql';

export const AuthUser = createParamDecorator(async (_data: unknown, ctx: ExecutionContext) => {
	const gqlContext = GqlExecutionContext.create(ctx);
	const {req, jwtService, usersService} = gqlContext.getContext();

	if (!req?.cookies?.access_token) {
		throw new UnauthorizedException(); // ❌ Если нет токена — кидаем ошибку
	}

	if (!jwtService || !usersService) {
		throw new UnauthorizedException(); // ❌ Если сервисы не доступны — тоже ошибка
	}

	try {
		const payload = jwtService.verify(req.cookies.access_token);
		const user = await usersService.findById(payload.userId);

		if (!user) throw new UnauthorizedException(); // ❌ Если юзер не найден

		return user;
	} catch (err) {
		throw new UnauthorizedException(); // ❌ Ошибка валидации JWT
	}
});
