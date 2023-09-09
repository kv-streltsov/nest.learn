import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SecurityDevices } from '../../security-devices.schena';

@Injectable()
export class SecurityDevicesQueryRepositoryRepository {
  constructor(
    @InjectModel(SecurityDevices.name)
    private securityDevicesModel: Model<SecurityDevices>,
  ) {}

  async findDeviceSession(userId: string, deviceId: string, sessionId: string) {
    return this.securityDevicesModel.findOne({
      userId,
      deviceId,
      sessionId,
    });
  }

  async findDeviceSessions(userId: string) {
    return this.securityDevicesModel
      .find({
        userId: userId,
      })
      .select({ _id: 0, userId: 0, expiration: 0, __v: 0 })
      .lean();
  }
}
