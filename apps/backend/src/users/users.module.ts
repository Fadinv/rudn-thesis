import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from '@service/orm';
import {AuthModule} from '@backend/auth';
import {UsersService, UsersResolver} from '@backend/users';

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		AuthModule,
	],
	providers: [UsersService, UsersResolver],
	exports: [UsersService],
})
export class UsersModule {}
