import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogsSqlRepository } from '../../blogs/repositories/postgresql/blogs.sql.repository';
@Injectable()
export class DeleteBlogSaSqlUseCase {
  constructor(private blogSqlRepository: BlogsSqlRepository) {}
  async execute(blogId: string) {
    const deletedBlog = await this.blogSqlRepository.deleteBlog(blogId);
    if (!deletedBlog) throw new NotFoundException();
    return true;
  }
}
