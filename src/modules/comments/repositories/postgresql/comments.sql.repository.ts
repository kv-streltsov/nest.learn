import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsEntity } from '../../comments.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommentsSqlRepository {
  constructor(
    @InjectRepository(CommentsEntity)
    private readonly commentsSqlRepository: Repository<CommentsEntity>,
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
}
