import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwrPairDto } from '../../../auth/auth.service';
import { SecurityDevicesSqlRepository } from '../../repositories/postgresql/security-devices.sql.repository';
@Injectable()
export class CreateDeviceSessionSqlUseCase {
  constructor(
    private jwtService: JwtService,
    private securityDevicesRepository: SecurityDevicesSqlRepository,
  ) {}

  async execute(jwtPair: JwrPairDto, user: any) {
    const jwtPayload: any = this.jwtService.decode(jwtPair.refreshToken);
    jwtPayload.iat = new Date(jwtPayload.iat * 1000).toISOString();
    jwtPayload.exp = new Date(jwtPayload.exp * 1000).toISOString();

    await this.securityDevicesRepository.createDeviceSessions(jwtPayload, user);
  }
}
