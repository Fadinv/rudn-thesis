import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {StockPrice} from './stockPrice.entity';
import {StockPriceService} from './stockPrice.service';
import {StockPriceResolver} from './stockPrice.resolver';

@Module({
	imports: [TypeOrmModule.forFeature([StockPrice])],
	providers: [StockPriceService, StockPriceResolver],
	exports: [StockPriceService],
})
export class StockPriceModule {}
