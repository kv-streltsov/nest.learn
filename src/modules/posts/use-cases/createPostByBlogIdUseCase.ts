import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreatePostDto, ICreateModifiedPostDto } from '../dto/create-post.dto';
import { BloggerQueryRepository } from '../../blogger/blogger.query.repository';
import { PostsRepository } from '../posts.repository';

@Injectable()
export class CreatePostByBlogIdUseCase {
  constructor(
    private bloggerQueryRepository: BloggerQueryRepository,
    private postsRepository: PostsRepository,
  ) {}
  async execute(createPostDto: CreatePostDto, ownerId: string) {
    const foundBlog = await this.bloggerQueryRepository.getBlogById(
      createPostDto.blogId,
    );
    if (!foundBlog) throw new NotFoundException();
    if (foundBlog.ownerId !== ownerId) throw new ForbiddenException();

    const createPostData: ICreateModifiedPostDto = {
      id: randomUUID(),
      blogId: createPostDto.blogId,
      title: createPostDto.title,
      blogName: foundBlog.name,
      shortDescription: createPostDto.shortDescription,
      content: createPostDto.content,
      createdAt: new Date().toISOString(),
    };

    const createdPost = await this.postsRepository.createPost(createPostData);

    return {
      id: createdPost.id,
      blogId: createdPost.blogId,
      blogName: foundBlog.name,
      title: createdPost.title,
      shortDescription: createdPost.shortDescription,
      createdAt: createdPost.createdAt,
      content: createdPost.content,
    };
  }
}
