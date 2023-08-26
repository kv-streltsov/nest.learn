import { Injectable } from '@nestjs/common';
import { BloggerRepository } from '../blogger.repository';
import { randomUUID } from 'crypto';
import { ICreateBlogModifiedDto, CreateBlogDto } from '../dto/create-blog.dto';

@Injectable()
export class CreateBlogUseCase {
  constructor(private bloggerRepository: BloggerRepository) {}
  async execute(createBlogDto: CreateBlogDto, userId: string) {
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

    const createdBlog = await this.bloggerRepository.createBlog(newBlog);

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
