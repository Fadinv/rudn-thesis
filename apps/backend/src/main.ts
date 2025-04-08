import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe} from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.useGlobalPipes(new ValidationPipe());
	app.use(cookieParser());

	// Настраиваем CORS
	app.enableCors({
		origin: [
			'https://rudn-thesis.vercel.app',
			'http://localhost:3000',
			'http://localhost:4000',
		],
		credentials: true,
	});

	// Настраиваем GraphQL-контекст, чтобы Passport мог работать
	app.use((req, res, next) => {
		const origin = req.headers.origin;
		if (process.env.NODE_ENV === 'production' && origin !== 'https://rudn-thesis.vercel.app') {
			return res.status(403).send('Forbidden');
		}
		req.res = res;
		next();
	});

	await app.listen(4000, '0.0.0.0');
}

bootstrap();
