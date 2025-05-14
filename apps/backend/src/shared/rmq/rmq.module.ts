import {Module} from '@nestjs/common';
import {ClientsModule, Transport} from '@nestjs/microservices';
import {RmqPublisherService} from './rmq-publisher.service';
import {createRmqClientOptions, RmqQueues} from './rmq.config';

@Module({
	imports: [
		ClientsModule.register([
			{
				name: RmqQueues.portfolio.name,
				transport: Transport.RMQ,
				options: createRmqClientOptions(RmqQueues.portfolio.queue),
			},
		]),
	],
	providers: [RmqPublisherService],
	exports: [RmqPublisherService],
})
export class RmqModule {}
