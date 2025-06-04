import {
	CanActivate,
	ExecutionContext,
	HttpException,
	HttpStatus,
	Injectable,
} from '@nestjs/common';
import {GqlExecutionContext} from '@nestjs/graphql';

export class TooManyRequestsException extends HttpException {
	constructor(message = 'Слишком много запросов') {
		super(message, HttpStatus.TOO_MANY_REQUESTS);
	}
}

@Injectable()
export class GqlTokenThrottleGuard implements CanActivate {
	private readonly requestCounts = new Map<string, number>();
	private readonly windowMs = 60 * 1000;
	private readonly limit = 120;

	canActivate(context: ExecutionContext): boolean {
		const ctx = GqlExecutionContext.create(context);
		const req = ctx.getContext().req;

		const authHeader = req.headers['authorization'] || '';
		const token = authHeader.replace('Bearer ', '').trim();

		if (!token) {
			// Без токена — тротлим по IP
			const ip = req.ip || 'unknown';
			return this.checkAndThrottle(ip);
		}

		return this.checkAndThrottle(token);
	}

	private checkAndThrottle(key: string): boolean {
		const currentCount = this.requestCounts.get(key) || 0;

		if (currentCount >= this.limit) {
			throw new TooManyRequestsException('Слишком много запросов. Попробуйте позже.');
		}

		this.requestCounts.set(key, currentCount + 1);

		// Автоочистка через window
		setTimeout(() => {
			const updated = this.requestCounts.get(key) || 1;
			this.requestCounts.set(key, Math.max(0, updated - 1));
		}, this.windowMs);

		return true;
	}
}
