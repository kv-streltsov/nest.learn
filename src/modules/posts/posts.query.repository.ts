import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Posts } from './posts.schena';
import { BloggerQueryRepository } from '../blogger/blogger.query.repository';
import { UsersQueryRepository } from '../users/users.query.repository';

@Injectable()
export class PostsQueryRepository {
  private DEFAULT_SORT_FIELD = 'createdAt';
  private PROJECTION = { _id: 0, __v: 0 };
  constructor(
    @InjectModel(Posts.name) private postsModel: Model<Posts>,
    private bloggerQueryRepository: BloggerQueryRepository,
    private usersQueryRepository: UsersQueryRepository,
  ) {}
  async getPostById(postId: string) {
    const foundPost = await this.postsModel
      .findOne({ id: postId })
      .select({ _id: 0, __v: 0 })
      .lean();
    if (!foundPost) return foundPost;
    return this.banFilter(foundPost);
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

    const posts = await this.postsModel
      .find(findNameTerm)
      .select(this.PROJECTION)
      .sort(sortField)
      .skip(countItems)
      .limit(pageSize)
      .lean();

    const filteredPosts = await Promise.all(
      posts.map(async (post) => {
        return await this.banFilter(post);
      }),
    );
    const count: number = filteredPosts.filter(Boolean).length;

    return {
      pagesCount: Math.ceil(count / pageSize),
      page: pageNumber,
      pageSize,
      totalCount: count,
      items: filteredPosts.filter(Boolean),
    };
  }
  async getAllPostsByBlogId(
    blogId: string,
    pageNumber = 1,
    pageSize = 10,
    sortDirection: number,
    sortBy: string = this.DEFAULT_SORT_FIELD,
    searchNameTerm: string | null = null,
  ) {
    const foundBlog = await this.bloggerQueryRepository.getBlogById(blogId);
    if (!foundBlog) throw new NotFoundException();
    // if (foundBlog.ownerId !== ownerId) throw new ForbiddenException();

    const { countItems, sortField } = this.paginationHandler(
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    );
    const findNameTerm = searchNameTerm
      ? { blogId: blogId, name: { $regex: searchNameTerm, $options: 'i' } }
      : { blogId: blogId };

    const posts = await this.postsModel
      .find(findNameTerm)
      .select(this.PROJECTION)
      .sort(sortField)
      .skip(countItems)
      .limit(pageSize)
      .lean();

    const filteredPosts = await Promise.all(
      posts.map(async (post) => {
        return await this.banFilter(post);
      }),
    );
    const count: number = filteredPosts.filter(Boolean).length;

    return {
      pagesCount: Math.ceil(count / pageSize),
      page: pageNumber,
      pageSize,
      totalCount: count,
      items: posts,
    };
  }
  async banFilter(post: any) {
    return post;
    // if (post) {
    //   const foundBlog = await this.bloggerQueryRepository.getBlogById(
    //     post.blogId,
    //   );
    //   const foundUser = await this.usersQueryRepository.getUserById(
    //     foundBlog!.ownerId,
    //   );
    //   // @ts-ignore
    //   if (foundUser.banInfo.isBanned) return null;
    //   return post;
    // }
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
