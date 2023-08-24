import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { CreateDeviceSessionUseCase } from '../../security-devices/use-cases/createDeviceSessionUseCase';

export type JwrPairDto = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class LoginUseCase {
  constructor(
    private jwtService: JwtService,
    private createDeviceSessionUseCase: CreateDeviceSessionUseCase,
  ) {}
  async excecute(request: any, response: Response): Promise<JwrPairDto> {
    const jwtPair = await this.createJwtPair(request, response);
    await this.createDeviceSessionUseCase.excecute(jwtPair, request.user);
    return jwtPair;
  }
  private async createJwtPair(request: any, response: Response) {
    const jwtPair = {
      refreshToken: await this.jwtService.signAsync(
        {
          userId: request.user.userId,
          login: request.user.login,
          sessionId: randomUUID(),
          deviceId: request.user.deviceId || randomUUID(),
        },
        {
          expiresIn: '20s',
        },
      ),
      accessToken: await this.jwtService.signAsync(
        {
          userId: request.user.userId,
          login: request.user.login,
        },
        {
          expiresIn: '10s',
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
