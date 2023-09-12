import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtPayloadDto } from '../../../auth/strategies/refreshToken.strategy';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecurityDevicesEntity } from '../../security-devices.entity';
@Injectable()
export class SecurityDevicesSqlRepository {
  constructor(
    @InjectRepository(SecurityDevicesEntity)
    private readonly securityDevicesModel: Repository<SecurityDevicesEntity>,
  ) {}

  async createDeviceSessions(jwtPayload: JwtPayloadDto, user: any) {
    const foundSession = await this.securityDevicesModel.query(
      `SELECT "sessionId"
                FROM public."securityDevices"
                WHERE "userId" = $1 AND "deviceId" = $2`,
      [user.userId, jwtPayload.deviceId],
    );
    if (foundSession.length) {
      await this.securityDevicesModel.query(
        `UPDATE public."securityDevices"
                SET "sessionId"=$1,   ip=$2, issued=$3, expiration=$4
                WHERE "userId"= $5 AND "deviceId" = $6`,
        [
          jwtPayload.sessionId,
          user.ip,
          jwtPayload.iat,
          jwtPayload.exp,
          user.userId,
          jwtPayload.deviceId,
        ],
      );
      return true;
    }

    await this.securityDevicesModel.query(
      `INSERT INTO public."securityDevices"(
           "sessionId", issued, expiration, "userId", "deviceId", "userAgent", ip)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        jwtPayload.sessionId,
        jwtPayload.iat,
        jwtPayload.exp,
        jwtPayload.userId,
        jwtPayload.deviceId,
        user.userAgent,
        user.ip,
      ],
    );
    return true;
  }
  async deleteDeviceSession(user: any) {
    const deletedUser = await this.securityDevicesModel.query(
      `
            DELETE FROM public."securityDevices"
                WHERE "userId"=$1 AND "deviceId"=$2;`,
      [user.userId, user.deviceId],
    );
    return deletedUser[1];
  }
  async deleteDeviceSessionByDeviceId(deviceId: string, userId: string) {
    const foundSession = await this.securityDevicesModel
      .query(`SELECT  "deviceId", "userId"
                    FROM public."securityDevices"
                    WHERE "deviceId" = '${deviceId}'`);
    if (!foundSession.length) {
      throw new NotFoundException();
    }
    if (foundSession[0].userId !== userId) {
      throw new ForbiddenException();
    }
    return this.securityDevicesModel.query(`DELETE FROM public."securityDevices"
            WHERE "deviceId" = '${deviceId}';`);
  }
  async deleteAllDeviceSessionExcludeCurrent(userId: string, deviceId: string) {
    return this.securityDevicesModel.query(
      `DELETE FROM public."securityDevices"
            WHERE "deviceId" != '${deviceId}' AND "userId" = '${userId}';`,
    );
  }
}
