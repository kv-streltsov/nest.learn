import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LikesEntity } from '../../likes.entity';
import { Repository } from 'typeorm';
import { UsersSqlQueryRepository } from '../../../users/repositories/postgresql/users.sql.query.repository';
interface LikeCountInfo {
  likesCount: number;
  dislikesCount: number;
}
@Injectable()
export class LikesQuerySqlRepository {
  constructor(
    @InjectRepository(LikesEntity)
    private readonly likesSqlRepository: Repository<LikesEntity>,
    private usersSqlQueryRepository: UsersSqlQueryRepository,
  ) {}

  async getLike(entityId: string, userId: string) {
    console.log(`get like`, userId)
    const foundLike = await this.likesSqlRepository.query(
      `SELECT *
                FROM public.likes 
                WHERE "entityId" = '${entityId}' AND "userId" = '${userId}'`,
    );
    if (!foundLike.length) return null;
    return foundLike[0];
  }

  async getExtendedLikesInfo(
    entityId: string,
    userId: string | null = null,
    newestLikeFlag = true,
  ) {
    // get like count
    const likeCountInfo = await this.getLikeCount(entityId);

    // get newestLikes
    let newestLikesWithLogin;
    if (newestLikeFlag) {
      const newestLikes = await this.likesSqlRepository.query(
        `SELECT "userId","addedAt"
                 FROM public.likes
                 WHERE "entityId" = $1 AND "status" = 'Like'
                 ORDER BY "addedAt" DESC 
                 LIMIT 3`,
        [entityId],
      );

      newestLikesWithLogin = await Promise.all(
        newestLikes.map(async (like) => {
          const foundUser = await this.usersSqlQueryRepository.getUserById(
            like.userId,
          );
          return {
            login: foundUser!.login,
            userId: like.userId,
            addedAt: like.addedAt,
          };
        }),
      );
    }

    // get likeStatusCurrentUser
    let likeStatusCurrentUser: null | any = null;
    if (userId) likeStatusCurrentUser = await this.getLike(entityId, userId);
    if (newestLikeFlag) {
      return {
        likesCount: likeCountInfo.likesCount,
        dislikesCount: likeCountInfo.dislikesCount,
        myStatus:
          likeStatusCurrentUser === null
            ? `None`
            : likeStatusCurrentUser.status,
        newestLikes: newestLikesWithLogin,
      };
    }

    return {
      likesCount: likeCountInfo.likesCount,
      dislikesCount: likeCountInfo.dislikesCount,
      myStatus:
        likeStatusCurrentUser === null ? `None` : likeStatusCurrentUser.status,
    };
  }

  private async getLikeCount(entityId: string) {
    const likesCount: number = await this.likesSqlRepository
      .query(
        `SELECT COUNT(*) 
                 FROM public.likes
                 WHERE "entityId" = $1 AND status = 'Like'`,
        [entityId],
      )
      .then((data) => {
        return parseInt(data[0].count);
      });

    const dislikesCount: number = await this.likesSqlRepository
      .query(
        `SELECT COUNT(*) 
                 FROM public.likes
                 WHERE "entityId" = $1 AND status = 'Dislike'`,
        [entityId],
      )
      .then((data) => {
        return parseInt(data[0].count);
      });

    const likeCountInfo = {
      likesCount: likesCount,
      dislikesCount: dislikesCount,
    };

    return likeCountInfo;
  }
}
