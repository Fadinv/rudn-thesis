import {Module} from '@nestjs/common';
import {GraphQLModule} from '@nestjs/graphql';
import {ApolloDriver} from '@nestjs/apollo';
import {TypeOrmModule} from '@nestjs/typeorm';
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
			host: 'postgres',
			port: 5432,
			username: 'postgres',
			password: 'password',
			database: 'portfolio_db',
			autoLoadEntities: true,
			synchronize: true,
		}),
		AuthModule,
		UsersModule,
		StocksModule,
		PortfolioModule,
		StockPriceModule,
	],
})
export class AppModule {}
