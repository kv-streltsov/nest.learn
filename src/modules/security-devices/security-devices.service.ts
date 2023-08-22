import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SecurityDevicesRepository } from './security-devices.repository';
import { JwrPairDto } from '../auth/auth.service';
import { SecurityDevicesQueryRepositoryRepository } from './security-devices.query.repository';
import { JwtPayloadDto } from '../auth/strategies/refreshToken.strategy';

@Injectable()
export class SecurityDevicesService {
  constructor(
    private jwtService: JwtService,
    private securityDevicesRepository: SecurityDevicesRepository,
    private securityDevicesQueryRepositoryRepository: SecurityDevicesQueryRepositoryRepository,
  ) {}

  async createDeviceSession(jwtPair: JwrPairDto, user: any) {
    const jwtPayload: any = this.jwtService.decode(jwtPair.refreshToken);
    jwtPayload.iat = new Date(jwtPayload.iat * 1000).toISOString();
    jwtPayload.exp = new Date(jwtPayload.exp * 1000).toISOString();

    await this.securityDevicesRepository.createDeviceSessions(jwtPayload, user);
  }

  async logoutDeviceSession(user: any) {
    return this.securityDevicesRepository.deleteDeviceSession(user);
  }
  async logoutAllDevicesExcludeCurrent(pyload: any) {
    return this.securityDevicesRepository.deleteAllDeviceSessionExcludeCurrent(
      pyload.userId,
      pyload.deviceId,
    );
  }
}
