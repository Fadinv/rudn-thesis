import {Module} from '@nestjs/common';
import {GraphQLModule} from '@nestjs/graphql';
import {ApolloDriver, ApolloDriverConfig} from '@nestjs/apollo';
import {TypeOrmModule} from '@nestjs/typeorm';
import * as path from 'node:path';
import {UsersModule} from './users/users.module';

console.log(__dirname)
@Module({
	imports: [
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			autoSchemaFile: './schema.gql',
			playground: true,
			path: '/graphql',
			context: ({req, res}) => ({req, res}),
		}),
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: 'postgres',
			port: 5432,
			username: 'postgres',
			password: 'password',
			database: 'portfolio_db',
			autoLoadEntities: true,
			/** Создание миграций */
			// npm run typeorm migration:generate -- -n InitialMigration
			// npm run typeorm migration:run
			synchronize: true, // Таблицы создаются автоматически (Для production лучше отключить и создавать миграции)
		}),
		UsersModule,
	],
})
export class AppModule {}
