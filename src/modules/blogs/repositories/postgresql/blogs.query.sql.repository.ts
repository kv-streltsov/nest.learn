import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blogs } from '../../blogs.schena';
import { Model } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogsEntity } from '../../blogs.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BlogsQuerySqlRepository {
  private DEFAULT_SORT_FIELD = 'createdAt';
  private PROJECTION = { _id: 0, __v: 0, ownerId: 0 };
  constructor(
    @InjectRepository(BlogsEntity)
    private readonly blogSqlRepository: Repository<BlogsEntity>,
  ) {}
  async getBlogById(blogId: string) {
    const foundBlog = await this.blogSqlRepository.query(
      `SELECT id, "ownerId", name, description, "websiteUrl", "isMembership", "createdAt"
                FROM public.blogs
                WHERE id = $1`,
      [blogId],
    );
    if (foundBlog[0] === undefined) return null;
    return foundBlog[0];
  }
  async getAllBlogs(
    pageSize = 10,
    pageNumber = 1,
    sortBy: string = this.DEFAULT_SORT_FIELD,
    sortDirection: number,
    searchNameTerm: string | null = null,
  ) {
    const { countItems, sortField } = await this.paginationHandler(
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    );
    const findNameTerm = searchNameTerm
      ? { name: { $regex: searchNameTerm, $options: 'i' } }
      : {};

    const count: number = await this.blogSqlRepository
      .query(
        `SELECT COUNT(*) 
                        FROM public.users
                        ${searchNameTerm}`,
      )
      .then((data) => {
        return parseInt(data[0].count);
      });

    const blogs = await this.blogSqlRepository.query(
      `SELECT id, login, email, password, "createdAt", salt, confirmation
                FROM public.users
                $1`,
      [findNameTerm],
    );

    return {
      pagesCount: Math.ceil(count / pageSize),
      page: pageNumber,
      pageSize,
      totalCount: count,
      items: blogs,
    };
  }
  // async getBlogNameById(blogId: string) {
  //   const foundNameBlog = await this.blogsModel.findOne({ id: blogId }).select({
  //     _id: 0,
  //     id: 0,
  //     description: 0,
  //     createdAt: 0,
  //     isMembership: 0,
  //     __v: 0,
  //     websiteUrl: 0,
  //   });
  //   if (foundNameBlog === null) {
  //     return null;
  //   }
  //   return foundNameBlog.name;
  // }
  //
  private async paginationHandler(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: number,
  ) {
    const countItems = (pageNumber - 1) * pageSize;
    const sortField: any = {};
    sortField[sortBy] = sortDirection;

    return {
      countItems,
      sortField,
    };
  }
}
