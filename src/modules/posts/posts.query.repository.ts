import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Posts } from './posts.schena';
import { BloggerQueryRepository } from '../blogger/blogger.query.repository';

@Injectable()
export class PostsQueryRepository {
  private DEFAULT_SORT_FIELD = 'createdAt';
  private PROJECTION = { _id: 0, __v: 0 };
  constructor(
    @InjectModel(Posts.name) private postsModel: Model<Posts>,
    private bloggerQueryRepository: BloggerQueryRepository,
  ) {}
  async getPostById(postId: string) {
    return this.postsModel
      .findOne({ id: postId })
      .select({ _id: 0, __v: 0 })
      .lean();
  }
  async getAllPosts(
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

    const count: number = await this.postsModel.countDocuments(findNameTerm);
    const posts = await this.postsModel
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
      items: posts,
    };
  }
  async getAllPostsByBlogId(
    blogId: string,
    pageNumber = 1,
    pageSize = 10,
    sortDirection: number,
    sortBy: string = this.DEFAULT_SORT_FIELD,
    searchNameTerm: string | null = null,
    ownerId: string,
  ) {
    const foundBlog = await this.bloggerQueryRepository.getBlogById(blogId);
    if (!foundBlog) throw new NotFoundException();
    if (foundBlog.ownerId !== ownerId) throw new ForbiddenException();

    const { countItems, sortField } = this.paginationHandler(
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    );
    const findNameTerm = searchNameTerm
      ? { blogId: blogId, name: { $regex: searchNameTerm, $options: 'i' } }
      : { blogId: blogId };

    const count: number = await this.postsModel.countDocuments(findNameTerm);
    const posts = await this.postsModel
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
      items: posts,
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
