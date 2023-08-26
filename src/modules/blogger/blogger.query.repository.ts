import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Bloggers } from './blogger.schena';
import { Model } from 'mongoose';

@Injectable()
export class BloggerQueryRepository {
  private DEFAULT_SORT_FIELD = 'createdAt';
  private PROJECTION = { _id: 0, __v: 0, ownerId: 0 };
  constructor(
    @InjectModel(Bloggers.name) private bloggerModel: Model<Bloggers>,
  ) {}
  getBlogById(blogId: string) {
    return this.bloggerModel.findOne({ id: blogId }); //.select(this.PROJECTION);
  }
  async getAllBlogsCurrentUser(
    pageNumber = 1,
    pageSize = 10,
    sortDirection: number,
    sortBy: string = this.DEFAULT_SORT_FIELD,
    searchNameTerm: string | null = null,
    userId: string,
  ) {
    const { countItems, sortField } = this.paginationHandler(
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    );
    const findNameTerm = searchNameTerm
      ? { ownerId: userId, name: { $regex: searchNameTerm, $options: 'i' } }
      : { ownerId: userId };

    const count: number = await this.bloggerModel.countDocuments(findNameTerm);
    const blogs = await this.bloggerModel
      .find(findNameTerm)
      .select(this.PROJECTION)
      .sort(sortField)
      .skip(countItems)
      .limit(pageSize)
      .lean();

    return {
      pagesCount: Math.ceil(count / pageSize),
      page: pageNumber,
      pageSize,
      totalCount: count,
      items: blogs,
    };
  }
  async getBlogNameById(blogId: string) {
    const foundNameBlog = await this.bloggerModel
      .findOne({ id: blogId })
      .select({
        _id: 0,
        id: 0,
        description: 0,
        createdAt: 0,
        isMembership: 0,
        __v: 0,
        websiteUrl: 0,
      });
    if (foundNameBlog === null) {
      return null;
    }
    return foundNameBlog.name;
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
