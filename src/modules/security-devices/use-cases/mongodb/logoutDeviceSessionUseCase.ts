import { Injectable } from '@nestjs/common';
import { SecurityDevicesRepository } from '../../repositories/mongodb/security-devices.repository';

@Injectable()
export class LogoutDeviceSessionUseCase {
  constructor(private securityDevicesRepository: SecurityDevicesRepository) {}

  async execute(user: any) {
    return this.securityDevicesRepository.deleteDeviceSession(user);
  }
}
