import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';

@Controller('securityDevices')
export class SecurityDevicesController {
  @Get()
  @HttpCode(HttpStatus.OK)
  getAllDevicesForCurrentUser() {
    return true;
  }
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  //TODO: translate name method
  terminateDevicesExcludeCurrent() {
    return true;
  }
  @Delete(`:id`)
  @HttpCode(HttpStatus.NO_CONTENT)
  terminateDeviceById(@Param(`id`) deviceId: string) {
    return true;
  }
}
