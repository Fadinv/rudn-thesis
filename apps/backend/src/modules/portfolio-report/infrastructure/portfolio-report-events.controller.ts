import {Controller} from '@nestjs/common';
import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import {PortfolioReportEvents} from '../domain/portfolio-report.events';
import {PortfolioReportMemorySyncService} from './porttolio-report.memory-sync.service';
import {PortfolioReport} from '@service/orm';

@Controller()
export class PortfolioReportEventsController {
	constructor(private readonly syncService: PortfolioReportMemorySyncService) {}

	@EventPattern(PortfolioReportEvents.created)
	handleReportCreated(@Payload() payload: PortfolioReport, @Ctx() context: RmqContext) {
		console.log('---handleReportCreated / payload---');
		console.dir(payload);
		this.syncService.handlePortfolioCreated(payload);
		context.getChannelRef().ack(context.getMessage());
	}

	@EventPattern(PortfolioReportEvents.updated)
	handleReportUpdated(@Payload() payload: PortfolioReport, @Ctx() context: RmqContext) {
		console.log('---handleReportUpdated / payload---');
		console.dir(payload);

		this.syncService.handlePortfolioUpdated(payload);
		context.getChannelRef().ack(context.getMessage());
	}
}
