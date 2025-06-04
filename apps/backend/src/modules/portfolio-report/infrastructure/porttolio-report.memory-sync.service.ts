import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {PortfolioReport} from '@service/orm';
import {PortfolioReportEvents} from '../domain/portfolio-report.events';
import {PortfolioReportStore} from './portfolio-report.store';

export function NormalizeDateFields(...fields: string[]) {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor,
	) {
		const originalMethod = descriptor.value;

		descriptor.value = function (...args: any[]) {
			for (const arg of args) {
				if (arg && typeof arg === 'object') {
					for (const field of fields) {
						if (typeof arg[field] === 'string') {
							arg[field] = new Date(arg[field]);
						}
					}
				}
			}
			return originalMethod.apply(this, args);
		};

		return descriptor;
	};
}


@Injectable()
export class PortfolioReportMemorySyncService {
	constructor(private readonly portfolioStore: PortfolioReportStore) {}

	@OnEvent(PortfolioReportEvents.created)
	@NormalizeDateFields('createdAt', 'updatedAt')
	handlePortfolioCreated(report: PortfolioReport) {
		this.portfolioStore.addItem(report);
	}

	@OnEvent(PortfolioReportEvents.updated)
	@NormalizeDateFields('createdAt', 'updatedAt')
	handlePortfolioUpdated(report: PortfolioReport) {
		this.portfolioStore.updateItem(report);
	}

	@OnEvent(PortfolioReportEvents.deleted)
	@NormalizeDateFields('createdAt', 'updatedAt')
	handlePortfolioDeleted(report: PortfolioReport) {
		this.portfolioStore.updateItem(report);
	}
}

