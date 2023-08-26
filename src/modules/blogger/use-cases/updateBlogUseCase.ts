import { ForbiddenException, Injectable } from '@nestjs/common';
import { BloggerRepository } from '../blogger.repository';
import { CreateBlogDto } from '../dto/create-blog.dto';

@Injectable()
export class UpdateBlogUseCase {
  constructor(private bloggerRepository: BloggerRepository) {}
  async execute(blogId: string, updateBlogDto: CreateBlogDto, ownerId: string) {
    const updatedBlog = await this.bloggerRepository.updateBlog(
      blogId,
      updateBlogDto,
      ownerId,
    );
    if (updatedBlog.matchedCount === 0) {
      throw new ForbiddenException();
    }
    return true;
  }
}
