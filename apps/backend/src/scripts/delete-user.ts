import {NestFactory} from '@nestjs/core';
import {AppModule} from '@backend/app/app.module';
import {UsersService} from '@backend/modules/users/users.service';

async function main() {
	const userId = process.env.USER_ID;

	if (!userId || isNaN(Number(userId))) {
		throw new Error(`❌ Некорректный USER_ID: "${userId}"`);
	}

	const app = await NestFactory.createApplicationContext(AppModule);
	const usersService = app.get(UsersService);

	const user = await usersService.findById(Number(userId));
	if (!user) {
		console.log(`⚠️ Пользователь с ID ${userId} не найден.`);
		await app.close();
		return;
	}

	await usersService.deleteUser(user.id);
	console.log(`✅ Пользователь с ID ${userId} удалён.`);

	await app.close();
}

main().catch((err) => {
	console.error('❌ Ошибка при удалении пользователя:', err);
	process.exit(1);
});
