import { Injectable, NotFoundException } from '@nestjs/common';
import { PostsSqlRepository } from '../../posts/repositories/postgresql/posts.sql.repository';
import { BlogsQuerySqlRepository } from '../../blogs/repositories/postgresql/blogs.query.sql.repository';

@Injectable()
export class DeletePostByIdSqlUseCase {
  constructor(
    private blogsQueryRepository: BlogsQuerySqlRepository,
    private postsRepository: PostsSqlRepository,
  ) {}
  async execute(blogId: string, postId: string) {
    const foundBlog = await this.blogsQueryRepository.getBlogById(blogId);
    if (!foundBlog) throw new NotFoundException();

    const deletedPost = await this.postsRepository.deletePost(postId);
    if (!deletedPost) throw new NotFoundException();
    return true;
  }
}
