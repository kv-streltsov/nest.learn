import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Posts } from '../../posts.schena';
import { UsersQueryRepository } from '../../../users/repositories/mongodb/users.query.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { PostsEntity } from '../../posts.entity';
import { Repository } from 'typeorm';
import { BlogsQuerySqlRepository } from '../../../blogs/repositories/postgresql/blogs.query.sql.repository';
import { SortType } from '../../../users/users.interface';

@Injectable()
export class PostsQuerySqlRepository {
  private DEFAULT_SORT_FIELD = 'createdAt';
  constructor(
    @InjectRepository(PostsEntity)
    private readonly postSqlRepository: Repository<PostsEntity>,
    private blogsQueryRepository: BlogsQuerySqlRepository,
  ) {}
  async getPostById(postId: string) {
    const foundPost = await this.postSqlRepository.query(
      `SELECT public.posts.id, title, "shortDescription", content, public.posts."createdAt", "blogId",public.blogs.name as "blogName"
                FROM public.posts 
                LEFT JOIN public.blogs
                ON public.posts."blogId" = public.blogs.id
                WHERE public.posts.id = $1`,
      [postId],
    );
    if (!foundPost.length) return null;
    return foundPost[0];
  }
  async getAllPosts(
    pageSize = 10,
    pageNumber = 1,
    sortBy: string = this.DEFAULT_SORT_FIELD,
    sortDirection: number,
  ) {
    const { countItems, sortDirectionString, count } =
      await this.paginationHandler(pageNumber, pageSize, sortDirection, null);

    const foundPosts = await this.postSqlRepository.query(
      `SELECT public.posts.id, title, "shortDescription", content, public.posts."createdAt", "blogId",public.blogs.name as "blogName"
                FROM public.posts
                LEFT JOIN public.blogs
                ON public.posts."blogId" = public.blogs.id                
                ORDER BY public.posts."${sortBy}" ${
                sortBy === 'public.posts.createdAt' || sortBy === 'public.posts.id' ? '' : 'COLLATE "C"'
      } ${sortDirectionString}
                LIMIT ${pageSize} OFFSET ${countItems}`,
    );

    return {
      pagesCount: Math.ceil(count / pageSize),
      page: pageNumber,
      pageSize,
      totalCount: count,
      items: foundPosts,
    };
  }
  async getAllPostsByBlogId(
    blogId: string,
    pageNumber = 1,
    pageSize = 10,
    sortDirection: number,
    sortBy: string = this.DEFAULT_SORT_FIELD,
  ) {
    const foundBlog = await this.blogsQueryRepository.getBlogById(blogId);
    if (!foundBlog) throw new NotFoundException();

    const { countItems, sortDirectionString, count } =
      await this.paginationHandler(pageNumber, pageSize, sortDirection, blogId);

    const foundPosts = await this.postSqlRepository.query(
      `SELECT *
        FROM public.posts
        WHERE "blogId" = '${blogId}'
        ORDER BY "${sortBy}" ${
        sortBy === 'createdAt' || sortBy === 'id' || sortBy === 'blogId'
          ? ''
          : 'COLLATE "C"'
      } ${sortDirectionString}
        LIMIT ${pageSize} OFFSET ${countItems}`,
    );

    return {
      pagesCount: Math.ceil(count / pageSize),
      page: pageNumber,
      pageSize,
      totalCount: count,
      items: foundPosts,
    };
  }

  async paginationHandler(
    pageNumber: number,
    pageSize: number,
    sortDirection: number,
    blogId: string | null,
  ) {
    const countItems = (pageNumber - 1) * pageSize;
    const sortDirectionString = SortType[sortDirection];

    let whereTerm = '';
    blogId === null
      ? (whereTerm = '')
      : (whereTerm = `WHERE "blogId" = '${blogId}'`);

    const count: number = await this.postSqlRepository
      .query(
        `SELECT COUNT(*) 
                 FROM public.posts
                 ${whereTerm}`,
      )
      .then((data) => {
        return parseInt(data[0].count);
      });

    return {
      countItems,
      sortDirectionString,
      count,
    };
  }
}
