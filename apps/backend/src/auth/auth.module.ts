import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {JwtModule} from '@nestjs/jwt';
import {PassportModule} from '@nestjs/passport';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from '../users/user.entity';
import {UsersService} from '../users/users.service';
import {AuthResolver} from './auth.resolver';
import {JwtStrategy} from './jwt.strategy';

@Module({
	imports: [
		ConfigModule.forRoot({isGlobal: true}), // Загружаем переменные из .env
		TypeOrmModule.forFeature([User]), // Добавляем репозиторий пользователей
		PassportModule.register({defaultStrategy: 'jwt'}), // Регистрируем стратегию Passport
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_SECRET'),
				signOptions: {expiresIn: configService.get<string>('JWT_EXPIRES_IN')},
			}),
		}),
	],
	providers: [AuthResolver, UsersService, JwtStrategy], // Добавили JwtStrategy
	exports: [UsersService, PassportModule, JwtModule], // Экспортируем модули, чтобы их можно было использовать в других частях проекта
})
export class AuthModule {}
