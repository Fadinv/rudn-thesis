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
		if (!payload) throw new UnauthorizedException();

		return {email: payload.email, id: payload.sub};
	} catch (err) {
		// ❌ Ошибка валидации JWT
		throw new UnauthorizedException();
	}
});
