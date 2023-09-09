import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Likes } from './likes.schena';
import { UsersQueryRepository } from '../users/repositories/mongodb/users.query.repository';

@Injectable()
export class LikesRepository {
  constructor(@InjectModel(Likes.name) private likesModel: Model<Likes>) {}
  async createLikeStatus(
    entityId: string,
    userId: string,
    status: string,
    addedAt: string,
  ) {
    return this.likesModel.create({
      entityId,
      userId,
      status,
      addedAt,
    });
  }

  async updateLike(
    userId: string,
    entityId: string,
    status: string,
    addedAt: string,
  ) {
    return this.likesModel.updateOne(
      {
        userId,
        entityId,
      },
      { $set: { status: status, addedAt: addedAt } },
    );
  }

  async deleteLike(userId: string, entityId: string) {
    return this.likesModel.deleteOne({
      userId,
      entityId,
    });
  }

  async checkLikeExist(userId: string, entityId: string) {
    return this.likesModel.findOne({
      userId,
      entityId,
    });
  }
}
