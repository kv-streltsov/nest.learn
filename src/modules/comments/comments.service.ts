import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentInputDto } from './dto/create-comment.dto';
import { PostsQueryRepository } from '../posts/repositories/mongodb/posts.query.repository';
import { CommentsRepository } from './comments.repository';
import { LikesQueryRepository } from '../likes/likes.query.repository';
import { randomUUID } from 'crypto';
import { CommentsQueryRepository } from './comments.query.repository';

@Injectable()
export class CommentsService {
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private commentsRepository: CommentsRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    private likesQueryRepository: LikesQueryRepository,
  ) {}
  async createCommentInPost(
    commentInputDto: CommentInputDto,
    postId: string,
    user: any,
  ) {
    const commentDto = {
      id: randomUUID(),
      entityId: postId,
      commentatorInfo: {
        userId: user.userId,
        userLogin: user.login,
      },
      content: commentInputDto.content,
      createdAt: new Date().toISOString(),
    };
    const createdComment = await this.commentsRepository.createComment(
      commentDto,
    );
    const likesInfo = await this.likesQueryRepository.getExtendedLikesInfo(
      createdComment.entityId,
      createdComment.commentatorInfo.userId,
    );

    return {
      id: createdComment.id,
      content: createdComment.content,
      commentatorInfo: createdComment.commentatorInfo,
      createdAt: createdComment.createdAt,
      likesInfo: {
        likesCount: likesInfo.likesCount,
        dislikesCount: likesInfo.dislikesCount,
        myStatus: likesInfo.myStatus,
      },
    };
  }

  async updateComment(commentId: string, content: string, user: string) {
    const foundComment = await this.commentsQueryRepository.getCommentById(
      commentId,
    );
    if (foundComment === null) {
      throw new NotFoundException();
    }
    if (foundComment.commentatorInfo.userId !== user) {
      throw new ForbiddenException();
    }
    return this.commentsRepository.updateComment(commentId, content);
  }
  async deleteComment(commentId: string, user: string) {
    const foundComment = await this.commentsQueryRepository.getCommentById(
      commentId,
    );
    if (foundComment === null) {
      throw new NotFoundException();
    }

    if (foundComment.commentatorInfo.userId !== user) {
      throw new ForbiddenException();
    }
    return this.commentsRepository.deleteComment(commentId);
  }
}
