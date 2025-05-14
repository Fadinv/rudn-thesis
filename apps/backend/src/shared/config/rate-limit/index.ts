import createLimit from 'express-rate-limit';

export const rateLimit = createLimit({
	windowMs: 1 * 60 * 1000,
	limit: 60,
	message: 'toManyRequests',
});