import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersQueryRepository } from '../../users/repositories/mongodb/users.query.repository';
import * as process from 'process';
import { SecurityDevicesQueryRepositoryRepository } from '../../security-devices/repositories/mongodb/security-devices.query.repository';
import { UsersSqlQueryRepository } from '../../users/repositories/postgresql/users.sql.query.repository';
import { SecurityDevicesSqlQueryRepository } from '../../security-devices/repositories/postgresql/security-devices.sql.query.repository';

export interface JwtPayloadDto {
  login: string;
  email: string;
  userId: string;
  deviceId: string;
  iat: string;
  exp: string;
  ip: string;
  userAgent: string;
  sessionId: string;
}
@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private usersQueryRepository: UsersSqlQueryRepository,
    private securityDevicesQueryRepositoryRepository: SecurityDevicesSqlQueryRepository,
  ) {
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

  async validate(request: Request, payload: any) {
    const foundUser = await this.usersQueryRepository.getUserById(
      payload.userId,
    );
    const foundDevice =
      await this.securityDevicesQueryRepositoryRepository.findDeviceSession(
        payload.userId,
        payload.deviceId,
        payload.sessionId,
      );
    if (!foundUser || foundDevice === null) {
      throw new UnauthorizedException();
    }

    return {
      login: foundUser.login,
      email: foundUser.email,
      userId: payload.userId,
      deviceId: payload.deviceId,
      iat: new Date(payload.iat * 1000).toISOString(),
      exp: new Date(payload.exp * 1000).toISOString(),
      ip: request.ip,
      userAgent: request.headers['user-agent'] || `someDevice`,
    };
  }
}
