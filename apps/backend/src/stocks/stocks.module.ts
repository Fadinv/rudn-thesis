import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {StocksService} from './stocks.service';
import {StocksResolver} from './stocks.resolver';
import {Stock} from './stock.entity';
import {AuthModule} from '../auth/auth.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Stock]),
		AuthModule,
	],
	providers: [StocksService, StocksResolver],
	exports: [StocksService],
})
export class StocksModule {}
