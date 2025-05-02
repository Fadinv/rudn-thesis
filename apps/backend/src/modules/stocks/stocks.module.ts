import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Stock} from '@service/orm';
import {AuthModule} from '@backend/modules/auth';
import {StocksService} from '@backend/modules/stocks/application/stocks.service';
import {StocksResolver} from '@backend/modules/stocks/interface/stocks.resolver';

@Module({
	imports: [
		TypeOrmModule.forFeature([Stock]),
		AuthModule,
	],
	providers: [StocksService, StocksResolver],
	exports: [StocksService],
})
export class StocksModule {}
