import {GqlTokenThrottleGuard} from '@backend/shared/guards/gql-token-throttle.guard';
import {syncPortfolioVersions} from '@backend/initializations/portfolio.sync-version';
import {syncPortfolioReportsVersions} from '@backend/initializations/portfolio-report.sync-version';
import {NestFactory} from '@nestjs/core';
import {ValidationPipe} from '@nestjs/common';
import cookieParser from 'cookie-parser';
import {AppModule} from '@backend/app/app.module';
import {config} from './shared/config';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.useGlobalPipes(new ValidationPipe());
	app.use(cookieParser());

	// Настраиваем CORS
	app.enableCors(config.corsConfig);

	// Настраиваем GraphQL-контекст, чтобы Passport мог работать
	app.use((req, res, next) => {
		req.res = res;
		next();
	});

	// app.use(config.rateLimit);

	// app.useGlobalGuards(new GqlTokenThrottleGuard());

	await syncPortfolioVersions(app);
	await syncPortfolioReportsVersions(app);

	app.connectMicroservice(config.connectMicroService.portfolioQueue);

	await app.listen(4000, '0.0.0.0');
}

void bootstrap();
