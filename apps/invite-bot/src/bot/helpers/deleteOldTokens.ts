import {redis} from '../../redis';

export async function deleteOldTokens(userId: number) {
	const keys = await redis.keys('login:*');
	for (const key of keys) {
		const val = await redis.get(key);
		if (val === userId.toString()) {
			await redis.del(key);
		}
	}
}