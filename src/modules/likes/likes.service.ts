import { Injectable, NotFoundException } from '@nestjs/common';
import { LikesRepository } from './likes.repository';
import { LikeStatusEnum } from './dto/create-like.dto';
import { PostsQueryRepository } from '../posts/repositories/mongodb/posts.query.repository';
import { CommentsQueryRepository } from '../comments/comments.query.repository';
import { LikesQueryRepository } from './likes.query.repository';
import { isLogLevelEnabled } from '@nestjs/common/services/utils';

@Injectable()
export class LikesService {
  constructor(
    private likesRepository: LikesRepository,
    private likesQueryRepository: LikesQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}
  async createLikeStatus(entityId: string, userId: string, likeStatus: string) {
    const foundComment = await this.commentsQueryRepository.getCommentById(
      entityId,
    );
    const foundPost = await this.postsQueryRepository.getPostById(entityId);
    // if entity not exist return 404
    if (!foundComment && !foundPost) {
      throw new NotFoundException();
    }
    // if likeStatus = NONE -> delete like
    if (likeStatus === LikeStatusEnum.None) {
      return this.likesRepository.deleteLike(userId, entityId);
    }

    const addedAt: string = new Date().toISOString();
    // if like exist
    const foundLike = await this.likesQueryRepository.getLike(entityId, userId);
    if (foundLike !== null) {
      return this.likesRepository.updateLike(
        userId,
        entityId,
        likeStatus,
        addedAt,
      );
    }

    // if like not exist -> create like
    return this.likesRepository.createLikeStatus(
      entityId,
      userId,
      likeStatus,
      addedAt,
    );
  }
}
