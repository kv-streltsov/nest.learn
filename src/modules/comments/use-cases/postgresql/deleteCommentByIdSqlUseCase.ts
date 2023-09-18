import { CommandHandler } from '@nestjs/cqrs';
import { CommentsSqlRepository } from '../../repositories/postgresql/comments.sql.repository';
import { UsersSqlQueryRepository } from '../../../users/repositories/postgresql/users.sql.query.repository';
import { CommentsQuerySqlRepository } from '../../repositories/postgresql/comments.query.sql.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class DeleteCommentByIdSqlUseCaseCommand {
  constructor(public commentId: string, public user: any) {}
}
@CommandHandler(DeleteCommentByIdSqlUseCaseCommand)
export class DeleteCommentByIdSqlUseCase {
  constructor(
    private commentsSqlRepository: CommentsSqlRepository,
    private usersSqlQueryRepository: UsersSqlQueryRepository,
    private commentsQuerySqlRepository: CommentsQuerySqlRepository,
  ) {}
  async execute(command: DeleteCommentByIdSqlUseCaseCommand) {
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
    return this.commentsSqlRepository.deleteComment(command.commentId);
  }
}
