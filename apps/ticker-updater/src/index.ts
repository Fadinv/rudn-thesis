import * as cron from 'node-cron';
import {updateTickers} from './updateTickers';

console.log('✅ Сервис обновления тикеров запущен.');

let isUpdating = false; // Флаг выполнения обновления

async function runUpdate() {
	if (isUpdating) {
		console.log('⚠ Обновление уже выполняется, пропускаем запуск.');
		return;
	}

	isUpdating = true;
	try {
		console.log('🔄 Запуск обновления тикеров...');
		await updateTickers();
		console.log('✅ Обновление завершено!');
	} catch (error) {
		console.error('❌ Ошибка при обновлении тикеров:', error);
	} finally {
		isUpdating = false; // Всегда сбрасываем флаг после выполнения
	}
}

// 🟢 Принудительное обновление при старте (однократно)
runUpdate();

// ⏳ Запускаем cron каждые 5 минут (можешь менять на `*/1` для тестов)
cron.schedule('*/360 * * * *', async () => {
	console.log('⏳ Плановое обновление тикеров...');
	await runUpdate();
});
