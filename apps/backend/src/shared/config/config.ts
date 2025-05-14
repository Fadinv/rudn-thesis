import {rateLimit} from 'apps/backend/src/shared/config/rate-limit';
import {portfolioQueue} from 'apps/backend/src/shared/config/rabbit/portfolio-queue';
import {corsConfig} from 'apps/backend/src/shared/config/cors';

export const config = {
	corsConfig,
	rateLimit,
	connectMicroService: {
		portfolioQueue,
	},
};