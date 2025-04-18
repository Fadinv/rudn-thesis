import {NestFactory} from '@nestjs/core';
import {ValidationPipe} from '@nestjs/common';
import cookieParser from 'cookie-parser';
import {AppModule} from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.useGlobalPipes(new ValidationPipe());
	app.use(cookieParser());

	// Настраиваем CORS
	app.enableCors({
		origin: [
			'https://www.portfolioanalyzer.ru',
			'https://portfolioanalyzer.ru',
			'https://rudn-thesis.vercel.app',
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

	await app.listen(4000, '0.0.0.0');
}

void bootstrap();
