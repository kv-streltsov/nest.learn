import { Injectable } from '@nestjs/common';
import { CreateBlogDto, ICreateBlogModifiedDto } from './dto/create-blog.dto';
import { BlogsRepository } from './repositories/mongodb/blogs.repository';
import { randomUUID } from 'crypto';

@Injectable()
export class BlogsService {
  constructor(private blogsRepository: BlogsRepository) {}
  async createBlog(createBlogDto: CreateBlogDto) {
    const createData = {
      id: randomUUID(),
      ownerId: null,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };
    const newBlog: ICreateBlogModifiedDto = {
      ...createData,
      ...createBlogDto,
    };

    const createdBlog = await this.blogsRepository.createBlog(newBlog);

    return {
      id: createdBlog.id,
      name: createdBlog.name,
      description: createdBlog.description,
      websiteUrl: createdBlog.websiteUrl,
      createdAt: createdBlog.createdAt,
      isMembership: createdBlog.isMembership,
    };
  }
  async updateBlog(blogId: string, updateBlogDto: CreateBlogDto) {
    const updatedBlog = await this.blogsRepository.updateBlog(
      blogId,
      updateBlogDto,
    );
    if (updatedBlog.matchedCount === 0) {
      return null;
    }
    return true;
  }
  async deleteBlog(blogId: string) {
    const deletedBlog = await this.blogsRepository.deleteBlog(blogId);
    if (deletedBlog.deletedCount === 0) {
      return null;
    }
    return true;
  }
}
