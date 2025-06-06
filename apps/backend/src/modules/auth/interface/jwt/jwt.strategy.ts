import {Injectable} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy, ExtractJwt} from 'passport-jwt';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(configService: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(req) => req?.cookies?.access_token ?? null,
			]),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>('JWT_SECRET') as string,
		});
	}

	async validate(payload: any) {
		return {userId: payload.sub, email: payload.email};
	}
}
