import { CommandHandler } from '@nestjs/cqrs';
import { CommentInputDto } from '../../dto/create-comment.dto';
import { randomUUID } from 'crypto';
import { CommentsSqlRepository } from '../../repositories/postgresql/comments.sql.repository';
import { LikesQuerySqlRepository } from '../../../likes/repositories/postgresql/likes.query.sql.repository';

export class CreateCommentInPostSqlUseCaseCommand {
  constructor(
    public commentInputDto: CommentInputDto,
    public postId: string,
    public user: any,
  ) {}
}
@CommandHandler(CreateCommentInPostSqlUseCaseCommand)
export class CreateCommentInPostSqlUseCase {
  constructor(
    private commentsSqlRepository: CommentsSqlRepository,
    private likesQuerySqlRepository: LikesQuerySqlRepository,
  ) {}
  async execute(command: CreateCommentInPostSqlUseCaseCommand) {
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
    const likesInfo = await this.likesQuerySqlRepository.getLike(
      commentDto.id,
      command.user.userId,
    );
    return commentDto;
  }
}
