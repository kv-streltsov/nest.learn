import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../../auth.service';
import { CreateDeviceSessionSqlUseCase } from '../../../security-devices/use-cases/postgresql/createDeviceSessionSqlUseCase';
export type JwrPairDto = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class LoginSqlUseCase {
  constructor(
    private createDeviceSessionUseCase: CreateDeviceSessionSqlUseCase,
    private authService: AuthService,
  ) {}
  async execute(request: any, response: Response): Promise<JwrPairDto> {
    const jwtPair = await this.authService.createJwtPair(request, response);
    await this.createDeviceSessionUseCase.execute(jwtPair, request.user);
    return jwtPair;
  }
}
