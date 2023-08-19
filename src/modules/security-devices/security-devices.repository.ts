import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SecurityDevices } from './security-devices.schena';

@Injectable()
export class SecurityDevicesRepository {
  constructor(
    @InjectModel(SecurityDevices.name)
    private securityDevicesModel: Model<SecurityDevices>,
  ) {}

  async createDeviceSessions(jwtPayload: any, userAgent: string, ip: string) {
    const userId = jwtPayload.userId;
    const result = await this.securityDevicesModel
      .find({
        ip,
        userAgent,
        userId,
      })
      .lean();

    if (result.length) {
      await this.securityDevicesModel.updateOne(
        { userId },
        {
          $set: {
            issued: jwtPayload.iat,
            expiration: jwtPayload.exp,
            deviceId: jwtPayload.deviceId,
          },
        },
      );
      return true;
    }

    await this.securityDevicesModel.create({
      issued: jwtPayload.iat,
      expiration: jwtPayload.exp,
      userId: jwtPayload.userId,
      deviceId: jwtPayload.deviceId,
      userAgent,
      ip,
    });
    return true;
  }
}
