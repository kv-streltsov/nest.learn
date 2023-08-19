import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comments } from './comments.schena';

@Injectable()
export class CommentsQueryRepository {
  private DEFAULT_SORT_FIELD = 'createdAt';
  private PROJECTION = { _id: 0, __v: 0 };
  constructor(
    @InjectModel(Comments.name) private commentsModel: Model<Comments>,
  ) {}
  getCommentById(commentId: string) {
    return this.commentsModel.findOne({ id: commentId });
  }
  async getCommentsByPostId(
    postId: string,
    pageNumber = 1,
    pageSize = 10,
    sortDirection: number,
    sortBy: string = this.DEFAULT_SORT_FIELD,
  ) {
    const count: number = await this.commentsModel.countDocuments({
      entityId: postId,
    });
    if (count === 0) throw new NotFoundException();

    const { countItems, sortField } = this.paginationHandler(
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    );
    const comments = await this.commentsModel
      .find({ entityId: postId })
      .select(this.PROJECTION)
      .skip(countItems)
      .sort(sortField)
      .select({
        __v: 0,
        _id: 0,
        entityId: 0,
        status: 0,
      })
      .limit(pageSize)
      .lean();

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

    return {
      countItems,
      sortField,
    };
  }
}
