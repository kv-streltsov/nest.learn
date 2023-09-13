import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostInBlogDto } from '../../posts/dto/create-post.dto';
import { BlogsQuerySqlRepository } from '../../blogs/repositories/postgresql/blogs.query.sql.repository';
import { PostsSqlRepository } from '../../posts/repositories/postgresql/posts.sql.repository';

@Injectable()
export class UpdatePostByBlogIdSqlUseCase {
  constructor(
    private blogsQueryRepository: BlogsQuerySqlRepository,
    private postsRepository: PostsSqlRepository,
  ) {}
  async execute(
    blogId: string,
    postId: string,
    updatePostDto: CreatePostInBlogDto,
  ) {
    const foundBlog = await this.blogsQueryRepository.getBlogById(blogId);
    if (!foundBlog) throw new NotFoundException();

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
