import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {typeOrmConfig} from './orm-config';

@Module({
	imports: [TypeOrmModule.forRoot(typeOrmConfig)],
})
export class OrmModule {}
