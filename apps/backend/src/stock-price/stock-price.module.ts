import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {StockPrice} from '@service/orm';
import {StockPriceService, StockPriceResolver} from '@backend/stock-price';

@Module({
	imports: [TypeOrmModule.forFeature([StockPrice])],
	providers: [StockPriceService, StockPriceResolver],
	exports: [StockPriceService],
})
export class StockPriceModule {}
