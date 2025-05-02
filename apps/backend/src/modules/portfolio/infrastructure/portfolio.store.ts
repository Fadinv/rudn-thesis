import {Injectable, OnModuleInit} from '@nestjs/common';
import {MemoryCacheStore} from '@backend/shared/cache/memory-cache.store';
import {Portfolio} from '@service/orm';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import * as console from 'node:console';

@Injectable()
export class PortfolioStore extends MemoryCacheStore<Portfolio> implements OnModuleInit {
	constructor(
		@InjectRepository(Portfolio)
		private readonly portfolioRepository: Repository<Portfolio>,
	) {
		super((portfolio) => portfolio.user as unknown as number);
	}

	async onModuleInit() {
		const portfolios = await this.portfolioRepository.find({
			loadRelationIds: {
				relations: ['user'],
			},
		});

		await this.initialize(() => Promise.resolve(portfolios));
		console.log(`✅ PortfolioStore initialized with ${portfolios.length} portfolios`);
	}
}
