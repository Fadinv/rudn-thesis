import {INestApplication} from '@nestjs/common';
import {getRepositoryToken} from '@nestjs/typeorm';
import {PortfolioReport} from '@service/orm';
import {Repository} from 'typeorm';

export async function syncPortfolioReportsVersions(app: INestApplication) {
	const reportsRepository = app.get<Repository<PortfolioReport>>(getRepositoryToken(PortfolioReport));

	const reports = await reportsRepository.find({
		order: {id: 'ASC'}, // чтобы порядок был стабильный
	});

	let currentVersion = 1;

	for (const item of reports) {
		item.version = currentVersion++;
		if (typeof item.deleted !== 'boolean') {
			item.deleted = false;
		}
	}

	if (reports.length > 0) {
		await reportsRepository.save(reports);
		console.log(`✅ PortfolioReport versions re-synced: updated ${reports.length} reports`);
	} else {
		console.log('⚠️ No reports found to update.');
	}
}
