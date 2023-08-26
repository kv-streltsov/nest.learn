import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BloggerRepository } from '../../blogger/blogger.repository';
import { BloggerQueryRepository } from '../../blogger/blogger.query.repository';
import { PostsRepository } from '../posts.repository';

@Injectable()
export class DeletePostByBlogIdUseCase {
  constructor(
    private bloggerQueryRepository: BloggerQueryRepository,
    private postsRepository: PostsRepository,
  ) {}
  async execute(blogId: string, postId: string, ownerId: string) {
    const foundBlog = await this.bloggerQueryRepository.getBlogById(blogId);
    if (!foundBlog) throw new NotFoundException();
    if (foundBlog.ownerId !== ownerId) throw new ForbiddenException();

    const deletedBlog = await this.postsRepository.deletePost(postId, blogId);
    if (deletedBlog.deletedCount === 0) {
      throw new NotFoundException();
    }
    return true;
  }
}
