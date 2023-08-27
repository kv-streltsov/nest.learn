import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { BloggerRepository } from '../../blogger/blogger.repository';
import { BloggerQueryRepository } from '../../blogger/blogger.query.repository';

@Injectable()
export class BindBlogWithUserUseCase {
  constructor(
    private bloggerRepository: BloggerRepository,
    private bloggerQueryRepository: BloggerQueryRepository,
  ) {}
  async execute(blogId: string, userId: string) {
    const foundBlog = await this.bloggerQueryRepository.getBlogById(blogId);
    if (!foundBlog || foundBlog.ownerId !== null)
      throw new BadRequestException();

    const updatedBlog = await this.bloggerRepository.bindBlogWithUser(
      blogId,
      userId,
    );
    if (updatedBlog.matchedCount === 0) {
      throw new ForbiddenException();
    }
    return true;
  }
}
