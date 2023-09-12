import { Injectable } from '@nestjs/common';
import {
  CreateBlogDto,
  ICreateBlogModifiedDto,
} from '../../dto/create-blog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogsEntity } from '../../blogs.entity';
@Injectable()
export class BlogsSqlRepository {
  constructor(
    @InjectRepository(BlogsEntity)
    private readonly blogSqlRepository: Repository<BlogsEntity>,
  ) {}
  async createBlog(createBlogDto: ICreateBlogModifiedDto) {
    await this.blogSqlRepository.query(
      `INSERT INTO public.blogs(
                id, "ownerId", name, description, "websiteUrl", "createdAt", "isMembership")
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        createBlogDto.id,
        createBlogDto.ownerId,
        createBlogDto.name,
        createBlogDto.description,
        createBlogDto.websiteUrl,
        createBlogDto.createdAt,
        createBlogDto.isMembership,
      ],
    );
    const createdBlog = await this.blogSqlRepository.query(
      `SELECT *
                FROM public.blogs
                WHERE id = $1`,
      [createBlogDto.id],
    );
    return createdBlog[0];
  }
  async updateBlog(blogId: string, updateBlogDto: CreateBlogDto) {
    return this.blogSqlRepository.query(
      `UPDATE public.blogs
                SET name=$1, description=$2, "websiteUrl"=$3
                WHERE id= $4`,
      [
        updateBlogDto.name,
        updateBlogDto.description,
        updateBlogDto.websiteUrl,
        blogId,
      ],
    );
  }
  async deleteBlog(blogId: string) {
    const deletedBlog = await this.blogSqlRepository.query(
      `DELETE FROM public.blogs
                WHERE id = $1`,
      [blogId],
    );

    if (!deletedBlog[1]) return null;
    return true;
  }
}
