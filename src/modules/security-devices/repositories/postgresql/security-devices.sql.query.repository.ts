import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SecurityDevicesEntity } from '../../security-devices.entity';
import { Repository } from 'typeorm';
@Injectable()
export class SecurityDevicesSqlQueryRepository {
  constructor(
    @InjectRepository(SecurityDevicesEntity)
    private readonly securityDevicesModel: Repository<SecurityDevicesEntity>,
  ) {}

  async findDeviceSession(userId: string, deviceId: string, sessionId: string) {
    const foundSession = await this.securityDevicesModel.query(
      `SELECT *
                    FROM public."security_devices"
                    WHERE "userId" = $1 AND "deviceId" = $2 AND "sessionId" = $3`,
      [userId, deviceId, sessionId],
    );
    if (foundSession[0] === undefined) {
      return null;
    }
    return foundSession[0];
  }

  async findDeviceSessions(userId: string) {
    const foundDevices = await this.securityDevicesModel.query(
      `SELECT  "deviceId", "userAgent" , ip, issued 
                FROM public."security_devices"
                WHERE "userId" = $1`,
      [userId],
    );
    return foundDevices;
  }
}
