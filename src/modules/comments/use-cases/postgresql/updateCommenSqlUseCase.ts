import { CommandHandler } from '@nestjs/cqrs';
import { CommentInputDto } from '../../dto/create-comment.dto';
import { CommentsSqlRepository } from '../../repositories/postgresql/comments.sql.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersSqlQueryRepository } from '../../../users/repositories/postgresql/users.sql.query.repository';
import { CommentsQuerySqlRepository } from '../../repositories/postgresql/comments.query.sql.repository';

export class UpdateCommentSqlUseCaseCommand {
  constructor(
    public content: string,
    public commentId: string,
    public user: any,
  ) {}
}
@CommandHandler(UpdateCommentSqlUseCaseCommand)
export class UpdateCommentSqlUseCase {
  constructor(
    private commentsSqlRepository: CommentsSqlRepository,
    private usersSqlQueryRepository: UsersSqlQueryRepository,
    private commentsQuerySqlRepository: CommentsQuerySqlRepository,
  ) {}
  async execute(command: UpdateCommentSqlUseCaseCommand) {
    const foundUser = await this.usersSqlQueryRepository.getUserById(
      command.user,
    );
    const foundComment = await this.commentsQuerySqlRepository.getCommentById(
      command.commentId,
    );
    if (!foundComment) throw new NotFoundException();
    if (foundUser.id !== foundComment.commentatorInfo.userId) {
      throw new ForbiddenException();
    }
    return this.commentsSqlRepository.updateComment(
      command.commentId,
      command.content,
    );
  }
}
