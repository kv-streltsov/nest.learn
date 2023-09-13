import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostInBlogDto } from '../../posts/dto/create-post.dto';
import { BlogsQuerySqlRepository } from '../../blogs/repositories/postgresql/blogs.query.sql.repository';
import { PostsSqlRepository } from '../../posts/repositories/postgresql/posts.sql.repository';
import { PostsQuerySqlRepository } from '../../posts/repositories/postgresql/posts.query.sql.repository';

@Injectable()
export class UpdatePostByBlogIdSqlUseCase {
  constructor(
    private blogsQueryRepository: BlogsQuerySqlRepository,
    private postsRepository: PostsSqlRepository,
    private postsQuerySqlRepository: PostsQuerySqlRepository,
  ) {}
  async execute(
    blogId: string,
    postId: string,
    updatePostDto: CreatePostInBlogDto,
  ) {
    const foundBlog = await this.blogsQueryRepository.getBlogById(blogId);
    if (!foundBlog) throw new NotFoundException();

    const foundPost = await this.postsQuerySqlRepository.getPostById(postId);
    if (!foundPost) throw new NotFoundException();

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
