import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { BlogsSqlRepository } from '../../blogs/repositories/postgresql/blogs.sql.repository';
import {
  CreateBlogDto,
  ICreateBlogModifiedDto,
} from '../../blogs/dto/create-blog.dto';

@Injectable()
export class CreateBlogSaSqlUseCase {
  constructor(private blogSqlRepository: BlogsSqlRepository) {}
  async execute(createBlogDto: CreateBlogDto, userId: string | null = null) {
    const createData = {
      ownerId: userId,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      isMembership: false,
    };
    const newBlog: ICreateBlogModifiedDto = {
      ...createData,
      ...createBlogDto,
    };

    const createdBlog = await this.blogSqlRepository.createBlog(newBlog);

    return {
      id: createdBlog.id,
      name: createdBlog.name,
      description: createdBlog.description,
      websiteUrl: createdBlog.websiteUrl,
      createdAt: createdBlog.createdAt,
      isMembership: createdBlog.isMembership,
    };
  }
}
