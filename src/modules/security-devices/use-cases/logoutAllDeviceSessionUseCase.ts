import { Injectable } from '@nestjs/common';
import { SecurityDevicesRepository } from '../security-devices.repository';

@Injectable()
export class LogoutAllDeviceSessionUseCase {
  constructor(private securityDevicesRepository: SecurityDevicesRepository) {}

  async execute(pyload: any) {
    return this.securityDevicesRepository.deleteAllDeviceSessionExcludeCurrent(
      pyload.userId,
      pyload.deviceId,
    );
  }
}
