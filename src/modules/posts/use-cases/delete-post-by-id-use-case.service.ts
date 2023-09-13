import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BloggerRepository } from '../../blogger/blogger.repository';
import { BloggerQueryRepository } from '../../blogger/blogger.query.repository';
import { PostsRepository } from '../repositories/mongodb/posts.repository';

@Injectable()
export class DeletePostByIdUseCase {
  constructor(
    private bloggerQueryRepository: BloggerQueryRepository,
    private postsRepository: PostsRepository,
  ) {}
  async execute(postId: string) {
    const deletedPost = await this.postsRepository.deletePost(postId);
    if (deletedPost.deletedCount === 0) {
      throw new NotFoundException();
    }
    return true;
  }
}
