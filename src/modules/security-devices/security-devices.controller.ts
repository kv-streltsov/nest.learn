import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RefreshTokenGuard } from '../auth/strategies/refreshToken.guard';
import { SecurityDevicesQueryRepositoryRepository } from './security-devices.query.repository';
import { SecurityDevicesRepository } from './security-devices.repository';
import { SecurityDevicesService } from './security-devices.service';

@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    private securityDevicesQueryRepositoryRepository: SecurityDevicesQueryRepositoryRepository,
    private securityDevicesRepository: SecurityDevicesRepository,
    private securityDevicesService: SecurityDevicesService,
  ) {}

  @Get()
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  async getAllDevicesForCurrentUser(@Request() request) {
    const foundSessions =
      await this.securityDevicesQueryRepositoryRepository.findDeviceSessions(
        request.user.userId,
      );

    return foundSessions.map((session) => {
      return {
        ip: session.ip,
        title: session.userAgent,
        deviceId: session.deviceId,
        lastActiveDate: session.issued,
      };
    });
  }

  @Delete()
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  terminateDevicesExcludeCurrent(@Request() request) {
    return this.securityDevicesService.logoutAllDevicesExcludeCurrent(
      request.user,
    );
  }

  @Delete(`:id`)
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  terminateDeviceById(@Param(`id`) deviceId: string, @Request() request) {
    return this.securityDevicesRepository.deleteDeviceSessionByDeviceId(
      deviceId,
      request.user.userId,
    );
  }
}