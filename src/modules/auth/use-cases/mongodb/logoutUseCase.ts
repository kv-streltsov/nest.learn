import { Injectable } from '@nestjs/common';
import { LogoutDeviceSessionUseCase } from '../../../security-devices/use-cases/mongodb/logoutDeviceSessionUseCase';

@Injectable()
export class LogoutUseCase {
  constructor(private logoutDeviceSessionUseCase: LogoutDeviceSessionUseCase) {}
  async execute(user: any) {
    return this.logoutDeviceSessionUseCase.execute(user);
  }
}
