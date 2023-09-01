import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Likes } from './likes.schena';
import { UsersQueryRepository } from '../users/users.query.repository';
import { LikeStatusEnum } from './dto/create-like.dto';

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
    const likesCount = await this.getLikeCount(entityId);

    // TODO: не всегда нужны новейшие лайки
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
      newestLikes
        .map(async (like: any) => {
          const foundUser = await this.usersQueryRepository.getUserById(
            like.userId,
          );
          // @ts-ignore
          if (foundUser!.banInfo.isBanned) {
            return null;
          }

          return {
            userId: like.userId,
            addedAt: like.addedAt,
            login: foundUser!.login,
          };
        })
        .filter(Boolean),
    );

    if (newestLike) {
      return {
        likesCount: likesCount.like,
        dislikesCount: likesCount.dislike,
        myStatus: likeStatus === null ? `None` : likeStatus.status,
        newestLikes: newLikes.filter(Boolean),
      };
    }
    return {
      likesCount: likesCount.like,
      dislikesCount: likesCount.dislike,
      myStatus: likeStatus === null ? `None` : likeStatus.status,
    };
  }
  async getLike(entityId: string, userId: string) {
    return this.likesModel.findOne({ entityId, userId }).lean();
  }
  private async getLikeCount(entityId: string) {
    const likeCountInfo = {
      like: 0,
      dislike: 0,
    };
    const likes = await this.likesModel.find({
      entityId: entityId,
    });
    await Promise.all(
      likes.map(async (like) => {
        const foundUser = await this.usersQueryRepository.getUserById(
          like.userId,
        );
        if (!foundUser) return null;
        // @ts-ignore
        if (!foundUser.banInfo.isBanned) {
          if (like.status === LikeStatusEnum.Like) likeCountInfo.like += 1;
          if (like.status === LikeStatusEnum.Dislike)
            likeCountInfo.dislike += 1;
        }
      }),
    );

    return likeCountInfo;
  }
}
