import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

export type JwrPairDto = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}
  public async createJwtPair(request: any, response: Response) {
    const jwtPair = {
      refreshToken: await this.jwtService.signAsync(
        {
          userId: request.user.userId,
          login: request.user.login,
          sessionId: randomUUID(),
          deviceId: request.user.deviceId || randomUUID(),
        },
        {
          expiresIn: '100m',
        },
      ),
      accessToken: await this.jwtService.signAsync(
        {
          userId: request.user.userId,
          login: request.user.login,
        },
        {
          expiresIn: '50m',
        },
      ),
    };

    response.cookie(`refreshToken`, jwtPair.refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return jwtPair;
  }
}
