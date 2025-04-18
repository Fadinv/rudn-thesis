import {TypeOrmModuleOptions} from '@nestjs/typeorm';
import {DataSourceOptions} from 'typeorm';

export const baseOrmConfig: DataSourceOptions = {
	type: 'postgres',
	url: process.env.DATABASE_URL,
	synchronize: true,
	logging: process.env.NODE_ENV === 'development',
	entities: [], // нужно переопределять при инициализации AppDataSource
};

export const typeOrmConfig: TypeOrmModuleOptions = {
	...baseOrmConfig,
	autoLoadEntities: true, // только для NestJS
};
