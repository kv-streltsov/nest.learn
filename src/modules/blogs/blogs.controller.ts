import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query, Request,
  UseGuards,
} from '@nestjs/common';
import { SortType } from '../users/users.interface';
import { AuthGlobalGuard } from '../../helpers/authGlobal.guard';
import { BlogsQuerySqlRepository } from './repositories/postgresql/blogs.query.sql.repository';
import { PostsQuerySqlRepository } from '../posts/repositories/postgresql/posts.query.sql.repository';
import {LikesQuerySqlRepository} from "../likes/repositories/postgresql/likes.query.sql.repository";
@UseGuards(AuthGlobalGuard)
@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsQueryRepository: BlogsQuerySqlRepository,
    private postsQueryRepository: PostsQuerySqlRepository,
    private likesQueryRepository:LikesQuerySqlRepository
  ) {}

  @Get()
  async getAllBlogs(@Query() query: any) {
    return this.blogsQueryRepository.getAllBlogs(
      query?.pageSize && Number(query.pageSize),
      query?.pageNumber && Number(query.pageNumber),
      query?.sortBy && query.sortBy,
      query?.sortDirection === 'asc' ? SortType.asc : SortType.desc,
      query?.searchNameTerm && query.searchNameTerm,
    );
  }

  @Get(`:id/posts`)
  async getAllPostsByBlogId(@Param(`id`) blogId: string, @Query() query: any,@Request() request) {
    const foundPosts = await this.postsQueryRepository.getAllPostsByBlogId(
      blogId,
      query?.pageNumber && Number(query.pageNumber),
      query?.pageSize && Number(query.pageSize),
      query?.sortDirection === 'asc' ? SortType.asc : SortType.desc,
      query?.sortBy && query.sortBy,
    );
    foundPosts.items = await Promise.all(
        foundPosts.items.map(async (post: { id: string }): Promise<any> => {
          const extendedLikesInfo =
              await this.likesQueryRepository.getExtendedLikesInfo(
                  post.id,
                  request.headers.authGlobal === undefined
                      ? null
                      : request.headers.authGlobal.userId,
              );
          return {
            ...post,
            extendedLikesInfo,
          };
        }),
    );
    return foundPosts;
  }

  @Get(`:id`)
  async getBlogById(@Param(`id`) blogId: string) {
    const foundBlog = await this.blogsQueryRepository.getBlogById(blogId);
    if (!foundBlog) {
      throw new NotFoundException('Blog not found');
    }
    return foundBlog;
  }
}
