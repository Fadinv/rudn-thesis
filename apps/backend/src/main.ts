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
		origin: ['http://localhost:3000', 'http://localhost:4000/graphql'], // cors
		credentials: true, // Разрешаем передачу кук и заголовков авторизации
	});

	// Настраиваем GraphQL-контекст, чтобы Passport мог работать
	app.use((req, res, next) => {
		req.res = res;
		next();
	});

	await app.listen(4000, '0.0.0.0');
}

bootstrap();
