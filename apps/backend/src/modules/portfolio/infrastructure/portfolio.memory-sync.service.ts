import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {Portfolio} from '@service/orm';
import {PortfolioEvents} from '@backend/modules/portfolio/domain/portfolio.events';
import {PortfolioStore} from '@backend/modules/portfolio/infrastructure/portfolio.store';

@Injectable()
export class PortfolioMemorySyncService {
	constructor(private readonly portfolioStore: PortfolioStore) {}

	@OnEvent(PortfolioEvents.created)
	handlePortfolioCreated(portfolio: Portfolio) {
		this.portfolioStore.addItem(portfolio);
	}

	@OnEvent(PortfolioEvents.updated)
	handlePortfolioUpdated(portfolio: Portfolio) {
		this.portfolioStore.updateItem(portfolio);
	}
}
