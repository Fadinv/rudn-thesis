import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Stock} from '@service/orm';
import {AuthModule} from '@backend/auth';
import {StocksService} from './stocks.service';
import {StocksResolver} from './stocks.resolver';

@Module({
	imports: [
		TypeOrmModule.forFeature([Stock]),
		AuthModule,
	],
	providers: [StocksService, StocksResolver],
	exports: [StocksService],
})
export class StocksModule {}
