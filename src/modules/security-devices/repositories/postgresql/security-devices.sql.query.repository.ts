import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SecurityDevices } from '../../security-devices.schena';
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
                    FROM public."securityDevices"
                    WHERE "userId" = $1 AND "deviceId" = $2 AND "sessionId" = $3`,
      [userId, deviceId, sessionId],
    );

    return foundSession[0];
  }

  // async findDeviceSessions(userId: string) {
  //   return this.securityDevicesModel
  //     .find({
  //       userId: userId,
  //     })
  //     .select({ _id: 0, userId: 0, expiration: 0, __v: 0 })
  //     .lean();
  // }
}
