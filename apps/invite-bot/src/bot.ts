import {Bot} from 'grammy';
import {registerCommands} from './bot/commands';

export function createBot() {
	const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
	registerCommands(bot);
	return bot;
}
