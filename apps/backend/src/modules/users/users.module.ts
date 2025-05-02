import {forwardRef, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from '@service/orm';
import {AuthModule} from '@backend/modules/auth';
import {UsersService, UsersResolver} from '@backend/modules/users/index';

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		forwardRef(() => AuthModule),
	],
	providers: [UsersService, UsersResolver],
	exports: [UsersService],
})
export class UsersModule {}
