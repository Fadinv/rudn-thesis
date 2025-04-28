import {GqlTokenThrottleGuard} from '@backend/comon/guards/gql-token-throttle.guard';
import {NestFactory} from '@nestjs/core';
import {ValidationPipe} from '@nestjs/common';
import cookieParser from 'cookie-parser';
import {AppModule} from './app.module';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.useGlobalPipes(new ValidationPipe());
	app.use(cookieParser());

	// Настраиваем CORS
	app.enableCors({
		origin: process.env.NODE_ENV === 'production'
			? [
				'https://www.portfolioanalyzer.ru',
				'https://portfolioanalyzer.ru',
				'https://rudn-thesis.vercel.app',
			]
			: [
				'http://localhost:3000',
				'http://localhost:4000',
			],
		credentials: true,
	});

	// Настраиваем GraphQL-контекст, чтобы Passport мог работать
	app.use((req, res, next) => {
		req.res = res;
		next();
	});

	app.use(
		rateLimit({
			windowMs: 1 * 60 * 1000,
			limit: 60,
			message: 'toManyRequests',
		}),
	);

	app.useGlobalGuards(new GqlTokenThrottleGuard());

	await app.listen(4000, '0.0.0.0');
}

void bootstrap();
