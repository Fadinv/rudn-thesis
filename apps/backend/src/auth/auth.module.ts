import {Module} from '@nestjs/common';
import {UsersService} from '../users/users.service';
import {AuthResolver} from './auth.resolver';
import {JwtModule} from '@nestjs/jwt';
import {TypeOrmModule} from '@nestjs/typeorm'; // Или Mikro-ORM
import {User} from '../users/user.entity';
import {JwtStrategy} from './jwt.strategy';

@Module({
	imports: [
		TypeOrmModule.forFeature([User]), // Или MikroOrmModule.forFeature([User])
		JwtModule.register({
			secret: 'MY_SECRET_KEY', // Вынести в .env
			signOptions: {expiresIn: '1h'},
		}),
	],
	providers: [AuthResolver, UsersService, JwtStrategy],
})
export class AuthModule {}
