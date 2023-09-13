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
  private PROJECTION = { _id: 0, __v: 0 };
  constructor(
    @InjectRepository(PostsEntity)
    private readonly postSqlRepository: Repository<PostsEntity>,
    @InjectModel(Posts.name) private postsModel: Model<Posts>,
    private blogsQueryRepository: BlogsQuerySqlRepository,
    private usersQueryRepository: UsersQueryRepository,
  ) {}
  async getPostById(postId: string) {
    const foundPost = await this.postSqlRepository.query(
      `SELECT *
        FROM public.posts
        WHERE id = $1`,
      [postId],
    );

    if (!foundPost) return null;
    return foundPost[0];
  }
  // async getAllPosts(
  //   pageNumber = 1,
  //   pageSize = 10,
  //   sortDirection: number,
  //   sortBy: string = this.DEFAULT_SORT_FIELD,
  //   searchNameTerm: string | null = null,
  // ) {
  //   const { countItems, sortField } = this.paginationHandler(
  //     pageNumber,
  //     pageSize,
  //     sortBy,
  //     sortDirection,
  //   );
  //
  //   const findNameTerm = searchNameTerm
  //     ? { name: { $regex: searchNameTerm, $options: 'i' } }
  //     : {};
  //
  //   const posts = await this.postsModel
  //     .find(findNameTerm)
  //     .select(this.PROJECTION)
  //     .sort(sortField)
  //     .skip(countItems)
  //     .limit(pageSize)
  //     .lean();
  //
  //   const filteredPosts = await Promise.all(
  //     posts.map(async (post) => {
  //       return await this.banFilter(post);
  //     }),
  //   );
  //   const count: number = filteredPosts.filter(Boolean).length;
  //
  //   return {
  //     pagesCount: Math.ceil(count / pageSize),
  //     page: pageNumber,
  //     pageSize,
  //     totalCount: count,
  //     items: filteredPosts.filter(Boolean),
  //   };
  // }
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
    blogId: string,
  ) {
    const countItems = (pageNumber - 1) * pageSize;
    const sortDirectionString = SortType[sortDirection];

    const count: number = await this.postSqlRepository
      .query(
        `SELECT COUNT(*) 
                 FROM public.posts
                 WHERE "blogId" = '${blogId}'`,
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
