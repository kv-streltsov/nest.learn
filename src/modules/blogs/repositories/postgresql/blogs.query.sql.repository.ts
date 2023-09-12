import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blogs } from '../../blogs.schena';
import { Model } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogsEntity } from '../../blogs.entity';
import { Repository } from 'typeorm';
import { SortType } from '../../../users/users.interface';

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
    const { countItems, sortDirectionString, searchTerm, count } =
      await this.paginationHandler(
        pageNumber,
        pageSize,
        searchNameTerm,
        sortDirection,
      );

    const foundBlogs = await this.blogSqlRepository.query(
      `SELECT id, name, description, "websiteUrl", "createdAt","isMembership"
                FROM public.blogs
                ${searchTerm}
                ORDER BY "${sortBy}" ${
        sortBy === 'createdAt' || sortBy === 'id' ? '' : 'COLLATE "C"'
      } ${sortDirectionString}
                LIMIT ${pageSize} OFFSET ${countItems}`,
    );

    return {
      pagesCount: Math.ceil(count / pageSize),
      page: pageNumber,
      pageSize,
      totalCount: count,
      items: foundBlogs,
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
    searchNameTerm: string | null,
    sortDirection,
  ) {
    const countItems = (pageNumber - 1) * pageSize;
    const sortDirectionString = SortType[sortDirection];

    let searchTerm: string;
    !searchNameTerm
      ? (searchTerm = ``)
      : (searchTerm = `WHERE name ILIKE '%${searchNameTerm}%'`);

    const count: number = await this.blogSqlRepository
      .query(
        `SELECT COUNT(*) 
                        FROM public.blogs
                        ${searchTerm}`,
      )
      .then((data) => {
        return parseInt(data[0].count);
      });

    return {
      countItems,
      sortDirectionString,
      searchTerm,
      count,
    };
  }
}
