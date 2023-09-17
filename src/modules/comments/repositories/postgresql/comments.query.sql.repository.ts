import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsEntity } from '../../comments.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommentsQuerySqlRepository {
  private DEFAULT_SORT_FIELD = 'createdAt';
  constructor(
    @InjectRepository(CommentsEntity)
    private readonly commentsSqlRepository: Repository<CommentsEntity>,
  ) {}
  async getCommentById(commentId: string) {
    const foundPost = await this.commentsSqlRepository.query(
      `SELECT *
        FROM public.comments
        WHERE id = $1`,
      [commentId],
    );
    if (!foundPost.length) return null;
    return foundPost[0];
  }
}
