import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BloggerRepository } from '../blogger.repository';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { BloggerQueryRepository } from '../blogger.query.repository';

@Injectable()
export class UpdateBlogUseCase {
  constructor(
    private bloggerRepository: BloggerRepository,
    private bloggerQueryRepository: BloggerQueryRepository,
  ) {}
  async execute(blogId: string, updateBlogDto: CreateBlogDto, ownerId: string) {
    const foundBlog = await this.bloggerQueryRepository.getBlogById(blogId);
    if (!foundBlog) throw new NotFoundException();
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
