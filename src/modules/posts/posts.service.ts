import { Injectable, NotFoundException } from '@nestjs/common';
import { ICreateModifiedPostDto, CreatePostDto } from './dto/create-post.dto';
import { randomUUID } from 'crypto';
import { PostsRepository } from './repositories/mongodb/posts.repository';
import { BlogsQueryRepository } from '../blogs/repositories/mongodb/blogs.query.repository';

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}
  async createPost(createPostDto: CreatePostDto) {
    const foundBlogName = await this.blogsQueryRepository.getBlogNameById(
      createPostDto.blogId,
    );
    if (!foundBlogName) throw new NotFoundException();

    const createPostData: ICreateModifiedPostDto = {
      id: randomUUID(),
      blogId: createPostDto.blogId,
      title: createPostDto.title,
      blogName: foundBlogName,
      shortDescription: createPostDto.shortDescription,
      content: createPostDto.content,
      createdAt: new Date().toISOString(),
    };

    const createdPost = await this.postsRepository.createPost(createPostData);

    return {
      id: createdPost.id,
      blogId: createdPost.blogId,
      blogName: foundBlogName,
      title: createdPost.title,
      shortDescription: createdPost.shortDescription,
      createdAt: createdPost.createdAt,
      content: createdPost.content,
    };
  }
  async updatePost(postId: string, updatePostDto: CreatePostDto) {
    const updatedPost = await this.postsRepository.updatePost(
      postId,
      updatePostDto,
    );
    if (updatedPost.matchedCount === 0) {
      return null;
    }
    return updatedPost;
  }
  // async deletePost(postId: string) {
  //   const deletedPost = await this.postsRepository.deletePost(postId);
  //   if (deletedPost.deletedCount === 0) {
  //     return null;
  //   }
  //   return true;
  // }
}
