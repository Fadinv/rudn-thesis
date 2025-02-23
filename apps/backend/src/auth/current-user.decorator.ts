import {createParamDecorator, ExecutionContext} from '@nestjs/common';
import {GqlExecutionContext} from '@nestjs/graphql';
import {Request} from 'express';

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	const gqlContext = GqlExecutionContext.create(ctx);
	const req: Request = gqlContext.getContext().req;

	const token = req.cookies?.access_token; // ✅ Читаем токен из куки
	if (!token) return null;

	try {
		const payload = req.app.get('JwtService').verify(token); // ✅ Декодируем токен
		return req.app.get('UsersService').findById(payload.userId); // ✅ Ищем пользователя по ID
	} catch (err) {
		return null; // Если токен невалидный, возвращаем `null`
	}
});
