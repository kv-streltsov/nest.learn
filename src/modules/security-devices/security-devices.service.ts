import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SecurityDevicesRepository } from './security-devices.repository';
import { JwrPairDto } from '../auth/auth.service';
import { SecurityDevicesQueryRepositoryRepository } from './security-devices.query.repository';

@Injectable()
export class SecurityDevicesService {
  constructor(
    private jwtService: JwtService,
    private securityDevicesRepository: SecurityDevicesRepository,
    private securityDevicesQueryRepositoryRepository: SecurityDevicesQueryRepositoryRepository,
  ) {}

  async createDeviceSession(jwtPair: JwrPairDto, headers: any, ip: string) {
    const jwtPayload: any = this.jwtService.decode(jwtPair.refreshToken);
    jwtPayload.iat = new Date(jwtPayload.iat * 1000).toISOString();
    jwtPayload.exp = new Date(jwtPayload.exp * 1000).toISOString();

    await this.securityDevicesRepository.createDeviceSessions(
      jwtPayload,
      headers[`user-agent`] || `someDevice`,
      ip,
    );
  }
  async logoutDeviceSession(sessionData: any) {
    return this.securityDevicesRepository.deleteDeviceSession(sessionData);
  }
  async logoutAllDevicesExcludeCurrent(pyload: any) {
    return this.securityDevicesRepository.deleteAllDeviceSessionExcludeCurrent(
      pyload.userId,
      pyload.deviceId,
    );
  }
  async getDeviceSession(userId: string, deviceId: string) {
    const foundSession =
      await this.securityDevicesQueryRepositoryRepository.findDeviceSession(
        userId,
        deviceId,
      );
    if (!foundSession) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
