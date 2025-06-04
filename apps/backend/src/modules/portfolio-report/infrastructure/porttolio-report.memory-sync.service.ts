import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {PortfolioReport} from '@service/orm';
import {PortfolioReportEvents} from '../domain/portfolio-report.events';
import {PortfolioReportStore} from './portfolio-report.store';

@Injectable()
export class PortfolioReportMemorySyncService {
	constructor(private readonly portfolioStore: PortfolioReportStore) {}

	@OnEvent(PortfolioReportEvents.created)
	handlePortfolioCreated(portfolio: PortfolioReport) {
		this.portfolioStore.addItem(portfolio);
	}

    @OnEvent(PortfolioReportEvents.updated)
    handlePortfolioUpdated(portfolio: PortfolioReport) {
        this.portfolioStore.updateItem(portfolio);
    }

   @OnEvent(PortfolioReportEvents.deleted)
   handlePortfolioDeleted(portfolio: PortfolioReport) {
       this.portfolioStore.updateItem(portfolio);
   }
}
