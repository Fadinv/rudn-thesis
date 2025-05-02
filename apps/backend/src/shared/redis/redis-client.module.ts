import {Module} from '@nestjs/common';
import {RedisModule} from '@nestjs-modules/ioredis';

@Module({
	imports: [
		RedisModule.forRoot({
			type: 'single',
			options: {
				host: 'redis',
				port: 6379,
			},
		}),
	],
})
export class RedisClientModule {}
