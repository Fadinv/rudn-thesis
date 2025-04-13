import {TypeOrmModuleOptions} from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
	type: 'postgres',
	url: process.env.DATABASE_URL,
	synchronize: true,
	autoLoadEntities: true,
	logging: process.env.NODE_ENV === 'development',
};
