import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe} from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.useGlobalPipes(new ValidationPipe());
	app.use(cookieParser());

	// Настраиваем GraphQL-контекст, чтобы Passport мог работать
	app.use((req, res, next) => {
		req.res = res;
		next();
	});

	await app.listen(4000, '0.0.0.0');
}

bootstrap();
