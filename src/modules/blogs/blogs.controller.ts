import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsQueryRepository } from './repositories/mongodb/blogs.query.repository';
import { SortType } from '../users/users.interface';
import { PostsQueryRepository } from '../posts/repositories/mongodb/posts.query.repository';
import { PostsService } from '../posts/posts.service';
import { LikesQueryRepository } from '../likes/likes.query.repository';
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
    return this.postsQueryRepository.getAllPostsByBlogId(
      blogId,
      query?.pageNumber && Number(query.pageNumber),
      query?.pageSize && Number(query.pageSize),
      query?.sortDirection === 'asc' ? SortType.asc : SortType.desc,
      query?.sortBy && query.sortBy,
    );
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
