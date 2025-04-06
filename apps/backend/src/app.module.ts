import {Module} from '@nestjs/common';
import {GraphQLModule} from '@nestjs/graphql';
import {ApolloDriver} from '@nestjs/apollo';
import {TypeOrmModule} from '@nestjs/typeorm';
import {PortfolioReportModule} from './portfolioReport/portfolioReport.module';
import {StockPriceModule} from './stockPrice/stockPrice.module';
import {UsersModule} from './users/users.module';
import {StocksModule} from './stocks/stocks.module';
import {PortfolioModule} from './portfolio/portfolio.module';
import {AuthModule} from './auth/auth.module';
import {JwtService} from '@nestjs/jwt';
import {UsersService} from './users/users.service';

@Module({
	imports: [
		GraphQLModule.forRootAsync({
			driver: ApolloDriver,
			imports: [AuthModule, UsersModule],
			inject: [JwtService, UsersService],
			useFactory: (jwtService: JwtService, usersService: UsersService) => ({
				autoSchemaFile: './schema.gql',
				playground: true,
				path: '/graphql',
				context: ({req, res}) => ({
					req,
					res,
					jwtService,
					usersService,
				}),
			}),
		}),
		TypeOrmModule.forRoot({
			type: 'postgres',
			url: process.env.DATABASE_URL,
			autoLoadEntities: true,
			synchronize: true,
		}),
		AuthModule,
		UsersModule,
		StocksModule,
		PortfolioModule,
		StockPriceModule,
		PortfolioReportModule,
	],
})
export class AppModule {}
