import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from '../../users.schema';
import { Model } from 'mongoose';
import { ModifiedUserDto } from '../../dto/update-users.dto';
import { BanUserInfo } from '../../../super-admin/use-cases/banUserUseCase';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(Users.name) private userModel: Model<Users>) {}
  createUser(userDto: ModifiedUserDto) {
    return this.userModel.create(userDto);
  }
  deleteUser(userId: string) {
    return this.userModel.deleteOne({ id: userId });
  }

  async updateConfirmationCode(code: string, pyload: any) {
    return this.userModel.updateOne(
      { 'confirmation.code': code },
      { $set: pyload },
    );
  }
  async updateConfirmationCodeByEmail(email: string, uuid: string) {
    return this.userModel.updateOne(
      { email: email },
      { $set: { 'confirmation.code': uuid } },
    );
  }
  async updateBanInfo(userId: string, banUserInfo: BanUserInfo) {
    if (!banUserInfo.isBanned) {
      return this.userModel.updateOne(
        { id: userId },
        {
          $set: {
            banInfo: {
              isBanned: false,
              banReason: null,
              banDate: null,
            },
          },
        },
      );
    }
    if (banUserInfo.isBanned) {
      return this.userModel.updateOne(
        { id: userId },
        { $set: { banInfo: banUserInfo } },
      );
    }
  }
}
