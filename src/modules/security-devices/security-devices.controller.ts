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
import { SecurityDevicesQueryRepositoryRepository } from './repositories/mongodb/security-devices.query.repository';
import { SecurityDevicesRepository } from './repositories/mongodb/security-devices.repository';
import { SecurityDevicesService } from './security-devices.service';
import { LogoutAllDeviceSessionUseCase } from './use-cases/mongodb/logoutAllDeviceSessionUseCase';
import { SecurityDevicesSqlQueryRepository } from './repositories/postgresql/security-devices.sql.query.repository';
import { LogoutAllDeviceSessionSqlUseCase } from './use-cases/postgresql/logoutAllDeviceSessionSqlUseCase';
import { LogoutDeviceSessionSqlUseCase } from './use-cases/postgresql/logoutDeviceSessionSqlUseCase';
@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    private securityDevicesQueryRepositoryRepository: SecurityDevicesSqlQueryRepository,
    private logoutDeviceSessionSqlUseCase: LogoutDeviceSessionSqlUseCase,
    private securityDevicesService: SecurityDevicesService,
    private logoutAllDeviceSessionUseCase: LogoutAllDeviceSessionSqlUseCase,
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
    return this.logoutAllDeviceSessionUseCase.execute(request.user);
  }

  @Delete(`:id`)
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  terminateDeviceById(@Param(`id`) deviceId: string, @Request() request) {
    return this.logoutDeviceSessionSqlUseCase.execute(
      deviceId,
      request.user.userId,
    );
  }
}
