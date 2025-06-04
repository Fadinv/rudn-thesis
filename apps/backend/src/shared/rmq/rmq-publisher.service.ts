import {Injectable} from '@nestjs/common';
import {connect, ChannelWrapper} from 'amqp-connection-manager';
import {RmqExchanges} from './rmq.config';
import {ConfirmChannel} from 'amqplib';

@Injectable()
export class RmqPublisherService {
       private channel: ChannelWrapper;

       constructor() {
               const connection = connect(['amqp://guest:guest@rabbitmq:5672']);
               this.channel = connection.createChannel({
                       json: true,
                       setup: async (channel: ConfirmChannel) => {
                               await channel.assertExchange(
                                       RmqExchanges.reports,
                                       'direct',
                                       {durable: true},
                               );
                       },
               });
       }

       async emit(routingKey: string, payload: any) {
               await this.channel.publish(
                       RmqExchanges.reports,
                       routingKey,
                       payload,
               );
       }
}
