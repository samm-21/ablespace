import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'pyramid_super_secret',
    });
  }

  async validate(payload: any) {
    if (!payload?.sub) throw new UnauthorizedException();
    const user = await this.usersService.findById(String(payload.sub));
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
