import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersQueryRepository } from '../users/users.query.repository';
import { Blogs } from '../blogs/blogs.schena';

@Injectable()
export class BloggerQueryRepository {
  private DEFAULT_SORT_FIELD = 'createdAt';
  private PROJECTION: any = { _id: 0, __v: 0 };
  constructor(
    @InjectModel(Blogs.name) private blogsModel: Model<Blogs>,
    private usersQueryRepository: UsersQueryRepository,
  ) {}
  getBlogById(blogId: string) {
    return this.blogsModel.findOne({ id: blogId }); //.select(this.PROJECTION);
  }
  async getAllBlogs(
    pageNumber = 1,
    pageSize = 10,
    sortDirection: number,
    sortBy: string = this.DEFAULT_SORT_FIELD,
    searchNameTerm: string | null = null,
    userId: string | null = null,
  ) {
    const { countItems, sortField } = this.paginationHandler(
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    );

    const findNameTerm: any = searchNameTerm
      ? { name: { $regex: searchNameTerm, $options: 'i' } }
      : {};

    // if this case call super admin then userId = null
    if (userId) {
      findNameTerm.ownerId = userId;
      this.PROJECTION.ownerId = 0;
    }

    const count: number = await this.blogsModel.countDocuments(findNameTerm);
    const blogs = await this.blogsModel
      .find(findNameTerm)
      .select(this.PROJECTION)
      .sort(sortField)
      .skip(countItems)
      .limit(pageSize)
      .lean();

    // if this case call super admin then userId = null
    if (!userId) {
      const adminBlogs = await Promise.all(
        blogs.map(async (blog) => {
          const foundUser = await this.usersQueryRepository.getUserById(
            blog.ownerId,
          );

          const blogOwnerInfo = foundUser
            ? {
                userId: foundUser.id,
                userLogin: foundUser.login,
              }
            : {
                userId: `not found owner`,
                userLogin: `not found owner`,
              };

          return {
            id: blog.id,
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt,
            isMembership: blog.isMembership,
            blogOwnerInfo,
          };
        }),
      );
      return {
        pagesCount: Math.ceil(count / pageSize),
        page: pageNumber,
        pageSize,
        totalCount: count,
        items: adminBlogs,
      };
    }
    if (userId) {
      return {
        pagesCount: Math.ceil(count / pageSize),
        page: pageNumber,
        pageSize,
        totalCount: count,
        items: blogs,
      };
    }
  }

  async getBlogNameById(blogId: string) {
    const foundNameBlog = await this.blogsModel.findOne({ id: blogId }).select({
      _id: 0,
      id: 0,
      description: 0,
      createdAt: 0,
      isMembership: 0,
      __v: 0,
      websiteUrl: 0,
    });
    if (foundNameBlog === null) {
      return null;
    }
    return foundNameBlog.name;
  }

  private paginationHandler(
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
