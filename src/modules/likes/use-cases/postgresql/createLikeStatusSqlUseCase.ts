import { CommandHandler } from '@nestjs/cqrs';
import { CommentsSqlRepository } from '../../../comments/repositories/postgresql/comments.sql.repository';
import { CommentsQuerySqlRepository } from '../../../comments/repositories/postgresql/comments.query.sql.repository';
import { PostsQuerySqlRepository } from '../../../posts/repositories/postgresql/posts.query.sql.repository';
import { NotFoundException } from '@nestjs/common';
import { LikesSqlRepository } from '../../repositories/postgresql/likes.sql.repository';
import { LikeStatusEnum } from '../../dto/create-like.dto';
import { LikesQuerySqlRepository } from '../../repositories/postgresql/likes.query.sql.repository';

export class CreateLikeStatusUseCaseCommand {
  constructor(
    public entityId: string,
    public userId: string,
    public likeStatus: string,
  ) {}
}
@CommandHandler(CreateLikeStatusUseCaseCommand)
export class CreateLikeStatusUseCase {
  constructor(
    private likesSqlRepository: LikesSqlRepository,
    private likesQuerySqlRepository: LikesQuerySqlRepository,
    private commentsQuerySqlRepository: CommentsQuerySqlRepository,
    private postsQuerySqlRepository: PostsQuerySqlRepository,
  ) {}
  async execute(command: CreateLikeStatusUseCaseCommand) {
    const foundComment = await this.commentsQuerySqlRepository.getCommentById(
      command.entityId,
    );
    const foundPosts = await this.postsQuerySqlRepository.getPostById(
      command.entityId,
    );
    if (!foundComment && !foundPosts) throw new NotFoundException();
    // if likeStatus = NONE -> delete like
    if (command.likeStatus === LikeStatusEnum.None) {
      return this.likesSqlRepository.deleteLike(command.entityId);
    }
    const addedAt = new Date().toISOString();
    // if like exist -> update like
    const foundLike = await this.likesQuerySqlRepository.getLike(
      command.entityId,
      command.userId,
    );
    if (foundLike !== null) {
      return this.likesSqlRepository.updateLike(
        command.userId,
        command.entityId,
        command.likeStatus,
        addedAt,
      );
    }

    return this.likesSqlRepository.createLikeStatus(
      command.entityId,
      command.userId,
      command.likeStatus,
      addedAt,
    );
  }
}
