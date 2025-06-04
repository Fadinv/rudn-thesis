import {RmqOptions} from '@nestjs/microservices';

export const RmqQueues = {
       portfolio: {
               name: 'RABBITMQ_PORTFOLIO_CLIENT',
               queue: 'portfolio_events_queue',
       },
       analyzer: {
               queue: 'analyzer_events_queue',
       },
       // можно добавить другие очереди позже:
       // reports: {
       //   name: 'RABBITMQ_REPORTS_CLIENT',
       //   queue: 'report_events_queue',
       // },
};

export const RmqExchanges = {
       reports: 'reports_exchange',
};

export function createRmqClientOptions(queueName: string): RmqOptions['options'] {
       return {
               urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672'],
               queue: queueName,
               queueOptions: {
                       durable: true,
               },
       };
}
