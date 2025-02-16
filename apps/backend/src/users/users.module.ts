import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { User } from './user.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module'; // ✅ Импортируем AuthModule

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		AuthModule, // ✅ Теперь UsersModule получает доступ к JwtService
	],
	providers: [UsersService, UsersResolver],
	exports: [UsersService],
})
export class UsersModule {}
