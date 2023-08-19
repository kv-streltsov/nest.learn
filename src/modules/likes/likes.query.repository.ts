import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Likes } from './likes.schena';
import { UsersQueryRepository } from '../users/users.query.repository';

@Injectable()
export class LikesQueryRepository {
  constructor(
    @InjectModel(Likes.name) private likesModel: Model<Likes>,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async getExtendedLikesInfo(
    entityId: string,
    userId: string | null = null,
    newestLike = true,
  ) {
    const like: number = await this.likesModel
      .countDocuments({ entityId: entityId, status: 'Like' })
      .lean();

    const dislike = await this.likesModel
      .countDocuments({ entityId: entityId, status: 'Dislike' })
      .lean();

    const newestLikes = await this.likesModel
      .find({ entityId: entityId, status: `Like` })
      .sort({ addedAt: -1 })
      .limit(3)
      .select({
        __v: 0,
        _id: 0,
        entityId: 0,
        status: 0,
      })
      .lean();

    const likeStatus = await this.likesModel
      .findOne({ userId: userId, entityId: entityId })
      .select({
        __v: 0,
        _id: 0,
        commentId: 0,
        userId: 0,
        entityId: 0,
        addedAt: 0,
      })
      .lean();

    const newLikes = await Promise.all(
      newestLikes.map(async (like: any) => {
        const findUser = await this.usersQueryRepository.getUserById(
          like.userId,
        );
        const login = findUser!.login;
        return {
          userId: like.userId,
          addedAt: like.addedAt,
          login: login,
        };
      }),
    );
    if (newestLike) {
      return {
        likesCount: like,
        dislikesCount: dislike,
        myStatus: likeStatus === null ? `None` : likeStatus.status,
        newestLikes: newLikes,
      };
    }
    return {
      likesCount: like,
      dislikesCount: dislike,
      myStatus: likeStatus === null ? `None` : likeStatus.status,
    };
  }
  async getLike(entityId: string, userId: string) {
    return this.likesModel.findOne({ entityId, userId }).lean();
  }
}
