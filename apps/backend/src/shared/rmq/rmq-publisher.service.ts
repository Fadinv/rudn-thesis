import {Inject, Injectable} from '@nestjs/common';
import {ClientProxy} from '@nestjs/microservices';
import {RmqQueues} from './rmq.config';

@Injectable()
export class RmqPublisherService {
	constructor(
		@Inject(RmqQueues.portfolio.name) // ✅ правильный токен
		private readonly client: ClientProxy,
	) {}

	async emit(event: string, data: any) {
		const {firstValueFrom} = await import('rxjs');
		return firstValueFrom(this.client.emit(event, data));
	}
}
