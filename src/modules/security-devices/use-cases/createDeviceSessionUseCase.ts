import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SecurityDevicesRepository } from '../security-devices.repository';
import { JwrPairDto } from '../../auth/auth.service';

@Injectable()
export class CreateDeviceSessionUseCase {
  constructor(
    private jwtService: JwtService,
    private securityDevicesRepository: SecurityDevicesRepository,
  ) {}

  async execute(jwtPair: JwrPairDto, user: any) {
    const jwtPayload: any = this.jwtService.decode(jwtPair.refreshToken);
    jwtPayload.iat = new Date(jwtPayload.iat * 1000).toISOString();
    jwtPayload.exp = new Date(jwtPayload.exp * 1000).toISOString();

    await this.securityDevicesRepository.createDeviceSessions(jwtPayload, user);
  }
}
