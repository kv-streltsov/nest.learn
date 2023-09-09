import { Injectable } from '@nestjs/common';
import { BanUserDto } from '../../security-devices/dto/ban-user.dto';
import { UsersRepository } from '../../users/repositories/mongodb/users.repository';
import { SecurityDevicesRepository } from '../../security-devices/repositories/mongodb/security-devices.repository';

export interface BanUserInfo {
  isBanned: boolean;
  banReason: string;
  banDate: string;
}
@Injectable()
export class BanUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private securityDevicesRepository: SecurityDevicesRepository,
  ) {}
  async execute(userId: string, banUserDto: BanUserDto) {
    const banUserInfo: BanUserInfo = {
      isBanned: banUserDto.isBanned,
      banReason: banUserDto.banReason,
      banDate: new Date().toISOString(),
    };
    await this.securityDevicesRepository.deleteAllDeviceSession(userId);
    return this.usersRepository.updateBanInfo(userId, banUserInfo);
  }
}
