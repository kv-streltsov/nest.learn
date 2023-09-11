import { Injectable } from '@nestjs/common';
import { SecurityDevicesRepository } from '../../repositories/mongodb/security-devices.repository';
import { SecurityDevicesSqlRepository } from '../../repositories/postgresql/security-devices.sql.repository';

@Injectable()
export class LogoutAllDeviceSessionSqlUseCase {
  constructor(
    private securityDevicesRepository: SecurityDevicesSqlRepository,
  ) {}

  async execute(pyload: any) {
    return this.securityDevicesRepository.deleteAllDeviceSessionExcludeCurrent(
      pyload.userId,
      pyload.deviceId,
    );
  }
}
