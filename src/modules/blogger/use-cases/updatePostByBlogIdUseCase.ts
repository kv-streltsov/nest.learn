import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreatePostDto,
  CreatePostInBlogDto,
} from '../../posts/dto/create-post.dto';
import { BloggerQueryRepository } from '../blogger.query.repository';
import { PostsRepository } from '../../posts/posts.repository';

@Injectable()
export class UpdatePostByBlogIdUseCase {
  constructor(
    private bloggerQueryRepository: BloggerQueryRepository,
    private postsRepository: PostsRepository,
  ) {}
  async execute(
    blogId: string,
    postId: string,
    updatePostDto: CreatePostInBlogDto,
    ownerId: string,
  ) {
    const foundBlog = await this.bloggerQueryRepository.getBlogById(blogId);
    if (!foundBlog) throw new NotFoundException();
    if (foundBlog.ownerId !== ownerId) throw new ForbiddenException();

    const updatedPost = await this.postsRepository.updatePost(
      postId,
      updatePostDto,
    );
    if (updatedPost.matchedCount === 0) {
      throw new NotFoundException();
    }
    return true;
  }
}
