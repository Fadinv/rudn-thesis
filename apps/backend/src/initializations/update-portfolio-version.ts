import {INestApplication} from '@nestjs/common';
import {getRepositoryToken} from '@nestjs/typeorm';
import {Portfolio} from '@service/orm';
import {Repository} from 'typeorm';

export async function syncPortfolioVersions(app: INestApplication) {
	const portfolioRepository = app.get<Repository<Portfolio>>(getRepositoryToken(Portfolio));

	const portfolios = await portfolioRepository.find({
		order: {id: 'ASC'}, // чтобы порядок был стабильный
	});

	let currentVersion = 1;

	for (const item of portfolios) {
		item.version = currentVersion++;
		if (typeof item.deleted !== 'boolean') {
			item.deleted = false;
		}
	}

	if (portfolios.length > 0) {
		await portfolioRepository.save(portfolios);
		console.log(`✅ Portfolio versions re-synced: updated ${portfolios.length} portfolios`);
	} else {
		console.log('⚠️ No portfolios found to update.');
	}
}
