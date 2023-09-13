import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SortType } from '../users/users.interface';
import { AuthGlobalGuard } from '../../helpers/authGlobal.guard';
import { BlogsQuerySqlRepository } from './repositories/postgresql/blogs.query.sql.repository';
import { PostsQuerySqlRepository } from '../posts/repositories/postgresql/posts.query.sql.repository';
@UseGuards(AuthGlobalGuard)
@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsQueryRepository: BlogsQuerySqlRepository,
    private postsQueryRepository: PostsQuerySqlRepository,
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
  async getAllPostsByBlogId(@Param(`id`) blogId: string, @Query() query: any) {
    const foundPost = await this.postsQueryRepository.getAllPostsByBlogId(
      blogId,
      query?.pageNumber && Number(query.pageNumber),
      query?.pageSize && Number(query.pageSize),
      query?.sortDirection === 'asc' ? SortType.asc : SortType.desc,
      query?.sortBy && query.sortBy,
    );
    const postsWithLikeInfo = foundPost.items.map((post) => {
      post.extendedLikesInfo = {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      };

      return post;
    });
    foundPost.items = postsWithLikeInfo;
    return foundPost;
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
