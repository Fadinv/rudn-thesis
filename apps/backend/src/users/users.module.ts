import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UsersService} from './users.service';
import {UsersResolver} from './users.resolver';
import {User} from './user.entity';
import {JwtModule} from '@nestjs/jwt'; // ✅ Добавляем JWT

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		JwtModule.register({
			secret: 'MY_SECRET_KEY', // Лучше вынести в .env
			signOptions: {expiresIn: '1h'},
		}),
	],
	providers: [UsersService, UsersResolver],
	exports: [UsersService],
})
export class UsersModule {}
