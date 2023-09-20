import {Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsEntity } from '../../comments.entity';
import { Repository } from 'typeorm';
import {SortType} from "../../../users/users.interface";

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
  async getCommentsByPostId(
      postId: string,
      pageNumber = 1,
      pageSize = 10,
      sortDirection: number,
      sortBy: string = this.DEFAULT_SORT_FIELD,
  ) {
    const count: number = await this.commentsSqlRepository
        .query(
            `SELECT COUNT(*) 
                 FROM public.comments
                 WHERE "entityId" = $1`,[postId]).then((data) => {
          return parseInt(data[0].count);
        });

    if (count === 0) throw new NotFoundException();

    const { countItems, sortDirectionString } = this.paginationHandler(
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
    );
    const comments = await this.commentsSqlRepository.query(
        `SELECT id,  content, "commentatorInfo", "createdAt"
        FROM public.comments
        WHERE "entityId" = '${postId}'
        ORDER BY "${sortBy}" ${
            sortBy === 'createdAt' || sortBy === 'id' || sortBy === 'blogId'
                ? ''
                : 'COLLATE "C"'
        } ${sortDirectionString}
        LIMIT ${pageSize} OFFSET ${countItems}`,
    );

    return {
      pagesCount: Math.ceil(count / pageSize),
      page: pageNumber,
      pageSize,
      totalCount: count,
      items: comments,
    };
  }
  paginationHandler(
      pageNumber: number,
      pageSize: number,
      sortBy: string,
      sortDirection: number,
  ) {
    const countItems = (pageNumber - 1) * pageSize;
    const sortField: any = {};
    sortField[sortBy] = sortDirection;
    const sortDirectionString = SortType[sortDirection];


    return {
      countItems,
      sortDirectionString
    };
  }
}
