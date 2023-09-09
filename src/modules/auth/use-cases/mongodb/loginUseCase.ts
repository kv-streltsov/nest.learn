import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { CreateDeviceSessionUseCase } from '../../../security-devices/use-cases/mongodb/createDeviceSessionUseCase';
import { AuthService } from '../../auth.service';

export type JwrPairDto = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class LoginUseCase {
  constructor(
    private createDeviceSessionUseCase: CreateDeviceSessionUseCase,
    private authService: AuthService,
  ) {}
  async execute(request: any, response: Response): Promise<JwrPairDto> {
    const jwtPair = await this.authService.createJwtPair(request, response);
    await this.createDeviceSessionUseCase.execute(jwtPair, request.user);
    return jwtPair;
  }
}
