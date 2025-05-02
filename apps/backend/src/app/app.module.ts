import {RedisClientModule} from '@backend/shared/redis/redis-client.module';
import {Module} from '@nestjs/common';
import {GraphQLModule} from '@nestjs/graphql';
import {ApolloDriver} from '@nestjs/apollo';
import {OrmModule} from '@service/orm';
import {PortfolioReportModule} from '@backend/modules/portfolio-report';
import {StockPriceModule} from '@backend/modules/stock-price';
import {UsersModule, UsersService} from '@backend/modules/users';
import {StocksModule} from '@backend/modules/stocks';
import {PortfolioModule} from '@backend/modules/portfolio';
import {AuthModule} from '@backend/modules/auth';
import {JwtService} from '@nestjs/jwt';
import {EventEmitterModule} from '@nestjs/event-emitter';

@Module({
	imports: [
		EventEmitterModule.forRoot(),
		RedisClientModule,
		GraphQLModule.forRootAsync({
			driver: ApolloDriver,
			imports: [AuthModule, UsersModule],
			inject: [JwtService, UsersService],
			useFactory: (jwtService: JwtService, usersService: UsersService) => ({
				autoSchemaFile: './schema.gql',
				playground: process.env.NODE_ENV !== 'production',
				path: '/graphql',
				context: ({req, res}) => ({
					req,
					res,
					jwtService,
					usersService,
				}),
			}),
		}),
		OrmModule,
		AuthModule,
		UsersModule,
		StocksModule,
		PortfolioModule,
		StockPriceModule,
		PortfolioReportModule,
	],
})
export class AppModule {}
