import {Injectable, OnModuleInit} from '@nestjs/common';
import {MemoryCacheStore} from '@backend/shared/cache/memory-cache.store';
import {PortfolioReport} from '@service/orm';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import * as console from 'node:console';

@Injectable()
export class PortfolioReportStore extends MemoryCacheStore<PortfolioReport> implements OnModuleInit {
	constructor(
		@InjectRepository(PortfolioReport)
		private readonly portfolioReportRepository: Repository<PortfolioReport>,
	) {
		super((report) => report.portfolio as unknown as number);
	}

	async onModuleInit() {
		const reports = await this.portfolioReportRepository.find({
			loadRelationIds: {
				relations: ['portfolio'],
			},
		});

		await this.initialize(() => Promise.resolve(reports));
		console.log(`✅ PortfolioStore initialized with ${reports.length} portfolios`);
	}
}
