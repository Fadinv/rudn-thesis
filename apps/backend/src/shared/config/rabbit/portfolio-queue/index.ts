import {createRmqClientOptions, RmqQueues} from '@backend/shared/rmq/rmq.config';
import {MicroserviceOptions, Transport} from '@nestjs/microservices';

export const portfolioQueue = {
	transport: Transport.RMQ,
	options: createRmqClientOptions(RmqQueues.portfolio.queue),
} as MicroserviceOptions;