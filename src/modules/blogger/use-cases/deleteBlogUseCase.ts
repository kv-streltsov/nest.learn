import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BloggerRepository } from '../blogger.repository';
import { BloggerQueryRepository } from '../blogger.query.repository';

@Injectable()
export class DeleteBlogUseCase {
  constructor(
    private bloggerRepository: BloggerRepository,
    private bloggerQueryRepository: BloggerQueryRepository,
  ) {}
  async execute(blogId: string, ownerId: string) {
    const foundBlog = await this.bloggerQueryRepository.getBlogById(blogId);
    if (!foundBlog) {
      throw new NotFoundException();
    }
    const deletedBlog = await this.bloggerRepository.deleteBlog(
      blogId,
      ownerId,
    );
    if (deletedBlog.deletedCount === 0) {
      throw new ForbiddenException();
    }
    return true;
  }
}
