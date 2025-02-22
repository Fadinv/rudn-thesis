import * as cron from 'node-cron';
import { updateTickers } from './updateTickers';

console.log('✅ Сервис обновления тикеров запущен.');

// 🟢 Сразу запускаем обновление (для теста)
(async () => {
	console.log('🔄 Принудительный запуск обновления тикеров...');
	await updateTickers();
	console.log('✅ Принудительное обновление завершено!');
})();

// Запускаем cron каждые 1 минуту для теста
cron.schedule('*/1 * * * *', async () => {
	console.log('🔄 Обновление тикеров...');
	await updateTickers();
	console.log('✅ Готово!');
});

// Оставляем процесс "живым"
setInterval(() => {}, 1000 * 60 * 60);
