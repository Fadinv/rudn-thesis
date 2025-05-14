import {CorsOptions} from 'apollo-server-express';

export const corsConfig: CorsOptions = {
	origin: process.env.NODE_ENV === 'production'
		? [
			'https://www.portfolioanalyzer.ru',
			'https://portfolioanalyzer.ru',
			'https://rudn-thesis.vercel.app',
		]
		: [
			'http://localhost:3000',
			'http://localhost:4000',
		],
	credentials: true,
};
