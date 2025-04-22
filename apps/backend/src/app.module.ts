import {RedisClientModule} from '@backend/redis/redis-client.module';
import {Module} from '@nestjs/common';
import {GraphQLModule} from '@nestjs/graphql';
import {ApolloDriver} from '@nestjs/apollo';
import {OrmModule} from '@service/orm';
import {PortfolioReportModule} from '@backend/portfolio-report';
import {StockPriceModule} from '@backend/stock-price';
import {UsersModule, UsersService} from '@backend/users';
import {StocksModule} from '@backend/stocks';
import {PortfolioModule} from '@backend/portfolio';
import {AuthModule} from '@backend/auth';
import {JwtService} from '@nestjs/jwt';

@Module({
	imports: [
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
