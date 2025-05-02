import {NestFactory} from '@nestjs/core';
import {AppModule} from '@backend/app/app.module';
import {UsersService} from '@backend/modules/users/users.service';
import {randomBytes, randomUUID} from 'crypto';
import {Redis} from 'ioredis';
import {getRedisConnectionToken} from '@nestjs-modules/ioredis';

function generateRandomEmail(): string {
	const prefix = randomBytes(4).toString('hex');
	return `user_${prefix}@demo.local`;
}

function generateRandomPassword(): string {
	const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
	let password = '';
	for (let i = 0; i < 12; i++) {
		password += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return password;
}

async function main() {
	const app = await NestFactory.createApplicationContext(AppModule);

	const usersService = app.get(UsersService);
	const redis = app.get<Redis>(getRedisConnectionToken());

	const email = generateRandomEmail();
	const password = generateRandomPassword();

	const user = await usersService.createUser(email, password);

	// Генерация одноразового логин-токена
	const token = randomUUID();
	await redis.set(`login:${token}`, user.id.toString(), 'EX', 600); // 10 минут

	const loginUrl = `https://www.portfolioanalyzer.ru/login?token=${token}`;

	console.log('✅ Пользователь создан:');
	console.log(`📨 Email: ${email}`);
	console.log(`🔑 Пароль: ${password}`);
	console.log(`🔗 Ссылка для входа: ${loginUrl}`);

	await app.close();
}

main().catch(console.error);
