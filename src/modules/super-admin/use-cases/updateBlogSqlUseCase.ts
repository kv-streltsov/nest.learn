import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { BlogsSqlRepository } from '../../blogs/repositories/postgresql/blogs.sql.repository';
import {
  CreateBlogDto,
  ICreateBlogModifiedDto,
} from '../../blogs/dto/create-blog.dto';
import { BlogsQuerySqlRepository } from '../../blogs/repositories/postgresql/blogs.query.sql.repository';

@Injectable()
export class UpdateBlogSaSqlUseCase {
  constructor(
    private blogSqlRepository: BlogsSqlRepository,
    private blogsQuerySqlRepository: BlogsQuerySqlRepository,
  ) {}
  async execute(blogId: string, updateBlogDto: CreateBlogDto) {
    const foundBlog = await this.blogsQuerySqlRepository.getBlogById(blogId);
    if (!foundBlog) throw new NotFoundException();

    await this.blogSqlRepository.updateBlog(blogId, updateBlogDto);
    return;
  }
}
