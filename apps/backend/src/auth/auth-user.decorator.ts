import {createParamDecorator, ExecutionContext, UnauthorizedException} from '@nestjs/common';
import {GqlExecutionContext} from '@nestjs/graphql';

export const AuthUser = createParamDecorator(async (_data: unknown, ctx: ExecutionContext) => {
	const gqlContext = GqlExecutionContext.create(ctx);
	const {req, jwtService, usersService} = gqlContext.getContext();

	if (!req?.cookies?.access_token) {
		// ❌ Если нет токена — кидаем ошибку
		throw new UnauthorizedException();
	}

	if (!jwtService || !usersService) {
		// ❌ Если сервисы не доступны — тоже ошибка
		throw new UnauthorizedException();
	}

	try {
		const payload = jwtService.verify(req.cookies.access_token);
		const user = await usersService.findById(payload.sub);

		// ❌ Если юзер не найден
		if (!user) throw new UnauthorizedException();

		return user;
	} catch (err) {
		// ❌ Ошибка валидации JWT
		throw new UnauthorizedException();
	}
});
