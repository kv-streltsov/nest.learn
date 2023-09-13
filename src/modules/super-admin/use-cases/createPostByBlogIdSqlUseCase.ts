import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PostsSqlRepository } from '../../posts/repositories/postgresql/posts.sql.repository';
import {
  CreatePostInBlogDto,
  ICreateModifiedPostDto,
} from '../../posts/dto/create-post.dto';
import { BlogsQuerySqlRepository } from '../../blogs/repositories/postgresql/blogs.query.sql.repository';
import { PostsQuerySqlRepository } from '../../posts/repositories/postgresql/posts.query.sql.repository';

@Injectable()
export class CreatePostByBlogIdSqlUseCase {
  constructor(
    private blogsQueryRepository: BlogsQuerySqlRepository,
    private postsRepository: PostsSqlRepository,
    private postsQuerySqlRepository: PostsQuerySqlRepository,
  ) {}
  async execute(blogId: string, createPostDto: CreatePostInBlogDto) {
    const foundBlog = await this.blogsQueryRepository.getBlogById(blogId);
    if (!foundBlog) throw new NotFoundException();

    const createPostData: ICreateModifiedPostDto = {
      id: randomUUID(),
      blogId: blogId,
      title: createPostDto.title,
      blogName: foundBlog.name,
      shortDescription: createPostDto.shortDescription,
      content: createPostDto.content,
      createdAt: new Date().toISOString(),
    };

    await this.postsRepository.createPost(createPostData);
    const createdPost = await this.postsQuerySqlRepository.getPostById(
      createPostData.id,
    );
    return {
      id: createdPost.id,
      blogId: createdPost.blogId,
      blogName: foundBlog.name,
      title: createdPost.title,
      shortDescription: createdPost.shortDescription,
      createdAt: createdPost.createdAt,
      content: createdPost.content,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    };
  }
}
