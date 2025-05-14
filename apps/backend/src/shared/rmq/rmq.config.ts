import {RmqOptions} from '@nestjs/microservices';

export const RmqQueues = {
	portfolio: {
		name: 'RABBITMQ_PORTFOLIO_CLIENT',
		queue: 'portfolio_events_queue',
	},
	// можно добавить другие очереди позже:
	// reports: {
	//   name: 'RABBITMQ_REPORTS_CLIENT',
	//   queue: 'report_events_queue',
	// },
};

export function createRmqClientOptions(queueName: string): RmqOptions['options'] {
	return {
		urls: ['amqp://guest:guest@rabbitmq:5672'], // позже подключим dotenv
		queue: queueName,
		queueOptions: {
			durable: true,
		},
	};
}
