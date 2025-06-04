import {Module} from '@nestjs/common';
import {RmqPublisherService} from './rmq-publisher.service';

@Module({
       providers: [RmqPublisherService],
       exports: [RmqPublisherService],
})
export class RmqModule {}
