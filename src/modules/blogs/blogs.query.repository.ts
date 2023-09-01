import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blogs } from './blogs.schena';
import { Model } from 'mongoose';

@Injectable()
export class BlogsQueryRepository {
  private DEFAULT_SORT_FIELD = 'createdAt';
  private PROJECTION = { _id: 0, __v: 0, ownerId: 0 };
  constructor(@InjectModel(Blogs.name) private blogsModel: Model<Blogs>) {}
  getBlogById(blogId: string) {
    return this.blogsModel.findOne({ id: blogId }).select(this.PROJECTION);
  }
  async getAllBlogs(
    pageNumber = 1,
    pageSize = 10,
    sortDirection: number,
    sortBy: string = this.DEFAULT_SORT_FIELD,
    searchNameTerm: string | null = null,
  ) {
    const { countItems, sortField } = this.paginationHandler(
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    );
    const findNameTerm = searchNameTerm
      ? { name: { $regex: searchNameTerm, $options: 'i' } }
      : {};

    const count: number = await this.blogsModel.countDocuments(findNameTerm);
    const blogs = await this.blogsModel
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
    const foundNameBlog = await this.blogsModel.findOne({ id: blogId }).select({
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
