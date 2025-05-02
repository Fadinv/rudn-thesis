import 'dotenv/config';
import {AppDataSource} from '@service/orm';
import {createBot} from './bot';

async function bootstrap() {
	await AppDataSource.initialize();
	const bot = createBot();
	await bot.start();
	console.log('🤖 Бот запущен');
}

bootstrap();
