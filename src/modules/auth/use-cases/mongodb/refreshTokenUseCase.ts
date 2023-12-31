import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { CreateDeviceSessionUseCase } from '../../../security-devices/use-cases/mongodb/createDeviceSessionUseCase';
import { AuthService } from '../../auth.service';
import { CreateDeviceSessionSqlUseCase } from '../../../security-devices/use-cases/postgresql/createDeviceSessionSqlUseCase';

export type JwrPairDto = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private createDeviceSessionUseCase: CreateDeviceSessionSqlUseCase,
    private authService: AuthService,
  ) {}
  async execute(request: any, response: Response) {
    const jwtPair: JwrPairDto = await this.authService.createJwtPair(
      request,
      response,
    );

    await this.createDeviceSessionUseCase.execute(jwtPair, request.user);
    return {
      accessToken: jwtPair.accessToken,
    };
  }
}
