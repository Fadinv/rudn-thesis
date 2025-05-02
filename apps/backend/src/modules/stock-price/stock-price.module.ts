import {StockPriceService} from '@backend/modules/stock-price/application/stock-price.service';
import {StockPriceResolver} from '@backend/modules/stock-price/interface/stock-price.resolver';
import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {StockPrice} from '@service/orm';

@Module({
	imports: [TypeOrmModule.forFeature([StockPrice])],
	providers: [StockPriceService, StockPriceResolver],
	exports: [StockPriceService],
})
export class StockPriceModule {}
