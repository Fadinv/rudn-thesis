import {Bot} from 'grammy';
import {registerCommands} from './bot/commands';

export function createBot() {
	const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
	registerCommands(bot);

	bot.catch(async (err) => {
		console.error('[TELEGRAM BOT ERROR]', err);

		const ctx = err.ctx;
		if (ctx?.reply) {
			await ctx.reply('❌ Произошла ошибка. Попробуйте позже.');
		}
	});

	return bot;
}
