import {Injectable, Logger} from '@nestjs/common';
import {connect, ChannelWrapper} from 'amqp-connection-manager';
import {RmqExchanges, RmqQueues} from './rmq.config';
import {ConfirmChannel} from 'amqplib';

@Injectable()
export class RmqPublisherService {
	private readonly logger = new Logger(RmqPublisherService.name);
	private channel: ChannelWrapper;

	constructor() {
		const connection = connect([
			process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672',
		]);
		this.channel = connection.createChannel({
			json: true,
			setup: async (channel: ConfirmChannel) => {
				await channel.assertExchange(
					RmqExchanges.reports,
					'direct',
					{durable: true},
				);
				await channel.assertQueue(RmqQueues.portfolio.queue, {durable: true});
				await channel.bindQueue(
					RmqQueues.portfolio.queue,
					RmqExchanges.reports,
					'report.created',
				);
				await channel.bindQueue(
					RmqQueues.portfolio.queue,
					RmqExchanges.reports,
					'report.updated',
				);
				await channel.bindQueue(
					RmqQueues.portfolio.queue,
					RmqExchanges.reports,
					'report.deleted',
				);

				await channel.assertQueue(RmqQueues.analyzer.queue, {durable: true});
				await channel.bindQueue(
					RmqQueues.analyzer.queue,
					RmqExchanges.reports,
					'report.created',
				);
				await channel.bindQueue(
					RmqQueues.analyzer.queue,
					RmqExchanges.reports,
					'report.updated',
				);
				await channel.bindQueue(
					RmqQueues.analyzer.queue,
					RmqExchanges.reports,
					'report.deleted',
				);
			},
		});
	}

	async emit(routingKey: string, payload: any) {
		try {
			await this.channel.publish(
				RmqExchanges.reports,
				routingKey,
				{
					pattern: routingKey,
					data: payload,
				},
			);
		} catch (err) {
			this.logger.error('Failed to publish message', err as Error);
		}
	}
}
