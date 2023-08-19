import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersQueryRepository } from '../../users/users.query.repository';
import * as process from 'process';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private usersQueryRepository: UsersQueryRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const data = request.cookies.refreshToken;
          if (!data) {
            return null;
          }
          return data;
        },
      ]),
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const foundUser = await this.usersQueryRepository.getUserById(
      payload.userId,
    );
    if (foundUser === null) throw new UnauthorizedException();
    return { ...foundUser, payload };
  }
}
