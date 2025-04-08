import {createParamDecorator, ExecutionContext} from '@nestjs/common';
import {GqlExecutionContext} from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
	async (_data: unknown, ctx: ExecutionContext) => {
		const gqlContext = GqlExecutionContext.create(ctx);
		const {req, jwtService, usersService} = gqlContext.getContext();

		if (!req?.cookies?.access_token) return null;

		if (!jwtService || !usersService) return null;

		try {
			const payload = jwtService.verify(req.cookies.access_token);
			return await usersService.findById(payload.sub);
		} catch (err) {
			console.error('Ошибка валидации JWT:', err);
			return null;
		}
	},
);
