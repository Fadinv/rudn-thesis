import {AppDataSource} from '@service/orm';
import {User} from '@service/orm';
import {randomBytes, randomUUID} from 'crypto';
import * as bcrypt from 'bcryptjs';
import {redis} from '../redis';
import {deleteOldTokens} from '../bot/helpers/deleteOldTokens';

function generateRandomEmail(): string {
	const prefix = randomBytes(4).toString('hex');
	return `user_${prefix}@demo.local`;
}

function generateRandomPassword(): string {
	const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
	return Array.from({length: 12}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

export async function findOrCreateUserAndToken(telegramId: string) {
	const userRepo = AppDataSource.getRepository(User);

	let user = await userRepo.findOneBy({telegramId});
	let isNew = false;
	let password: string | null = null;

	if (!user) {
		const email = generateRandomEmail();
		password = generateRandomPassword();
		const passwordHash = await bcrypt.hash(password, 10);

		user = userRepo.create({email, password: passwordHash, telegramId});
		await userRepo.save(user);
		isNew = true;
	}

	await deleteOldTokens(user.id);

	const token = randomUUID();
	await redis.set(`login:${token}`, user.id.toString(), 'EX', 600);

	return {
		email: user.email,
		password,
		isNew,
		loginUrl: process.env.NODE_ENV === 'production'
			? `https://www.portfolioanalyzer.ru/login?token=${token}`
			: `http://localhost:3000/login?token=${token}`,
	};
}
