import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {JwtModule} from '@nestjs/jwt';
import {PassportModule} from '@nestjs/passport';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from '@service/orm';
import {UsersService} from '@backend/users';
import {AuthResolver} from './auth.resolver';
import {JwtStrategy} from './jwt.strategy';

@Module({
	imports: [
		ConfigModule.forRoot({isGlobal: true}),
		TypeOrmModule.forFeature([User]),
		PassportModule.register({defaultStrategy: 'jwt'}),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_SECRET'),
				signOptions: {expiresIn: configService.get<string>('JWT_EXPIRES_IN')},
			}),
		}),
	],
	providers: [AuthResolver, UsersService, JwtStrategy],
	exports: [UsersService, PassportModule, JwtModule],
})
export class AuthModule {}
