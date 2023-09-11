import { Injectable } from '@nestjs/common';
import { SecurityDevicesRepository } from '../../repositories/mongodb/security-devices.repository';
import { SecurityDevicesSqlRepository } from '../../repositories/postgresql/security-devices.sql.repository';

@Injectable()
export class LogoutDeviceSessionSqlUseCase {
  constructor(
    private securityDevicesRepository: SecurityDevicesSqlRepository,
  ) {}

  async execute(deviceId: string, user: any) {
    return this.securityDevicesRepository.deleteDeviceSessionByDeviceId(
      deviceId,
      user,
    );
  }
}
