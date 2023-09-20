import { CommandHandler } from '@nestjs/cqrs';
import { CommentInputDto } from '../../dto/create-comment.dto';
import { randomUUID } from 'crypto';
import { CommentsSqlRepository } from '../../repositories/postgresql/comments.sql.repository';
import { LikesQuerySqlRepository } from '../../../likes/repositories/postgresql/likes.query.sql.repository';
import {PostsQuerySqlRepository} from "../../../posts/repositories/postgresql/posts.query.sql.repository";
import {NotFoundException} from "@nestjs/common";

export class CreateCommentInPostSqlUseCaseCommand {
  constructor(
    public commentInputDto: CommentInputDto,
    public postId: string,
    public user: any,
  ) {}
}
@CommandHandler(CreateCommentInPostSqlUseCaseCommand)
export class CreateCommentInPostSqlUseCase {
  constructor(private commentsSqlRepository: CommentsSqlRepository,private postsQuerySqlRepository:PostsQuerySqlRepository) {}
  async execute(command: CreateCommentInPostSqlUseCaseCommand) {
    const foundPost = await this.postsQuerySqlRepository.getPostById(command.postId)
    if(!foundPost) throw new NotFoundException()

    const commentDto = {
      id: randomUUID(),
      entityId: command.postId,
      commentatorInfo: {
        userId: command.user.userId,
        userLogin: command.user.login,
      },
      content: command.commentInputDto.content,
      createdAt: new Date().toISOString(),
    };
    await this.commentsSqlRepository.createComment(commentDto);

    return {
      id: commentDto.id,
      commentatorInfo: {
        userId: commentDto.commentatorInfo.userId,
        userLogin: commentDto.commentatorInfo.userLogin,
      },
      content: commentDto.content,
      createdAt: commentDto.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    };
  }
}
