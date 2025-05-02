import {Bot, Context, InlineKeyboard} from 'grammy';
import {findOrCreateUserAndToken} from '../services/invite.service';

export function registerCommands(bot: Bot) {
	bot.command('start', async (ctx) => {
		const keyboard = new InlineKeyboard().text('🔐 Войти в систему', 'entry');
		await ctx.reply('Добро пожаловать! 👋', {
			reply_markup: keyboard,
		});
	});

	bot.command('entry', async (ctx) => {
		await handleEntry(ctx);
	});

	bot.callbackQuery('entry', async (ctx) => {
		await ctx.answerCallbackQuery();
		await handleEntry(ctx);
	});

	bot.command('buttons', async (ctx) => {
		const keyboard = new InlineKeyboard()
			.text('Кнопка 1', 'btn-1')
			.text('Кнопка 2', 'btn-2');

		await ctx.reply('Выбери кнопку:', {reply_markup: keyboard});
	});

	bot.callbackQuery('btn-1', async (ctx) => {
		await ctx.answerCallbackQuery();
		await ctx.reply('Ты нажал Кнопку 1!');
	});

	bot.callbackQuery('btn-2', async (ctx) => {
		await ctx.answerCallbackQuery();
		await ctx.reply('Ты нажал Кнопку 2!');
	});
}

async function handleEntry(ctx: Context) {
	const telegramId = ctx.from?.id?.toString();
	if (!telegramId) {
		await ctx.reply('❌ Не удалось определить Telegram ID');
		return;
	}

	const {email, password, loginUrl, isNew} = await findOrCreateUserAndToken(telegramId);

	let message: string;

	if (isNew && password) {
		message = `user: ${email}\npass: ${password}\n\n${loginUrl}\n\n⚠️ Ссылка действительна в течение 10 минут.`;
	} else {
		message = `🔗 Вход:\n${loginUrl}\n\n⚠️ Ссылка действительна в течение 10 минут.`;
	}

	await ctx.reply(message);
}
