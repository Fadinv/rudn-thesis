import {updateMoexTickers} from './updateMoexTickers';
import * as cron from 'node-cron';
import {updateTickers} from './updateTickers';
import {AppDataSource} from '@service/orm';

console.log('✅ Сервис обновления тикеров запущен.');

let isUpdating = false; // Флаг выполнения обновления

async function runUpdate() {
	if (!AppDataSource.isInitialized) {
		await AppDataSource.initialize();
	}

	if (isUpdating) {
		console.log('⚠ Обновление уже выполняется, пропускаем запуск.');
		return;
	}

	isUpdating = true;
	try {
		console.log('🔄 Запуск обновления тикеров...');
		// await updateTickers();
		// await updateMoexTickers();
		console.log('✅ Обновление завершено!');
	} catch (error) {
		console.error('❌ Ошибка при обновлении тикеров:', error);
	} finally {
		isUpdating = false;
	}
}

// 🟢 Принудительное обновление при старте (однократно)
runUpdate();

// ⏳ Запускаем cron каждые 360 минут
cron.schedule('*/360 * * * *', async () => {
	console.log('⏳ Плановое обновление тикеров...');
	await runUpdate();
});
