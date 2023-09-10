import { Injectable } from '@nestjs/common';
import { SecurityDevicesSqlRepository } from '../../../security-devices/repositories/postgresql/security-devices.sql.repository';

@Injectable()
export class LogoutSqlUseCase {
  constructor(
    private logoutDeviceSessionUseCase: SecurityDevicesSqlRepository,
  ) {}
  async execute(user: any) {
    return this.logoutDeviceSessionUseCase.deleteDeviceSession(user);
  }
}
