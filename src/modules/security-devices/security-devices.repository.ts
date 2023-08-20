import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async deleteDeviceSession(sessionDate: any) {
    return this.securityDevicesModel.deleteOne({
      userId: sessionDate.userId,
      deviceId: sessionDate.deviceId,
    });
  }
  async deleteDeviceSessionByDeviceId(deviceId: string, userId: string) {
    const foundSession = await this.securityDevicesModel.findOne({ deviceId });
    if (foundSession === null) {
      throw new NotFoundException();
    }
    if (foundSession.userId !== userId) {
      throw new ForbiddenException();
    }
    return this.securityDevicesModel.deleteOne({
      deviceId: deviceId,
    });
  }

  async deleteAllDeviceSessionExcludeCurrent(userId: string, deviceId: string) {
    return this.securityDevicesModel.deleteMany({
      deviceId: { $ne: deviceId },
      userId: userId,
    });
  }
}
