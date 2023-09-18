import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsEntity } from '../../comments.entity';
import { Repository } from 'typeorm';
import { LikesSqlRepository } from '../../../likes/repositories/postgresql/likes.sql.repository';

@Injectable()
export class CommentsSqlRepository {
  constructor(
    @InjectRepository(CommentsEntity)
    private readonly commentsSqlRepository: Repository<CommentsEntity>,
    private likesSqlRepository: LikesSqlRepository,
  ) {}
  async createComment(createCommentDto: any) {
    return this.commentsSqlRepository.query(
      `INSERT INTO public.comments(
                  id, "entityId", content, "commentatorInfo", "createdAt")
                  VALUES ($1, $2, $3, $4, $5)`,
      [
        createCommentDto.id,
        createCommentDto.entityId,
        createCommentDto.content,
        createCommentDto.commentatorInfo,
        createCommentDto.createdAt,
      ],
    );
  }
  async deleteComment(commentId: string) {
    await this.likesSqlRepository.deleteLike(commentId);
    return this.commentsSqlRepository.query(
      `DELETE FROM public.comments
                WHERE id = $1`,
      [commentId],
    );
  }
}
