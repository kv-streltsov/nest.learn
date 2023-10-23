import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../helpers/auth.guard';
import { CreateUserDto } from '../users/dto/create-users.dto';
import { SortType } from '../users/users.interface';
import { CreateUserSqlUseCase } from '../users/use-cases/postgresql/createUserSqlUseCase';
import { DeleteUserSqlUseCase } from '../users/use-cases/postgresql/deleteUserSqlUseCase';
import { UsersSqlQueryRepository } from '../users/repositories/postgresql/users.sql.query.repository';
import { CreateBlogDto } from '../blogs/dto/create-blog.dto';
import { CreateBlogSaSqlUseCase } from './use-cases/createBlogSqlUseCase';
import { UpdateBlogSaSqlUseCase } from './use-cases/updateBlogSqlUseCase';
import { DeleteBlogSaSqlUseCase } from './use-cases/deleteBlogSqlUseCase';
import { BlogsQuerySqlRepository } from '../blogs/repositories/postgresql/blogs.query.sql.repository';
import { CreatePostInBlogDto } from '../posts/dto/create-post.dto';
import { CreatePostByBlogIdSqlUseCase } from './use-cases/createPostByBlogIdSqlUseCase';
import { UpdatePostByBlogIdSqlUseCase } from './use-cases/updatePostByBlogIdSqlUseCase';
import { DeletePostByIdSqlUseCase } from './use-cases/deletePostByIdSqlUseCase';
import { AccessTokenGuard } from '../auth/strategies/accessToken.guard';
import { PostsQuerySqlRepository } from '../posts/repositories/postgresql/posts.query.sql.repository';
@Controller('sa')
//TODO: USE CASE TO BUS
export class SuperAdminController {
  constructor(
    private blogsQueryRepository: BlogsQuerySqlRepository,
    private createBlogSaSqlUseCase: CreateBlogSaSqlUseCase,
    private createUserSqlUseCase: CreateUserSqlUseCase,
    private deleteUserSqlUseCase: DeleteUserSqlUseCase,
    private usersSqlQueryRepository: UsersSqlQueryRepository,
    private updateBlogSaSqlUseCase: UpdateBlogSaSqlUseCase,
    private deleteBlogSaSqlUseCase: DeleteBlogSaSqlUseCase,
    private createPostByBlogIdSqlUseCase: CreatePostByBlogIdSqlUseCase,
    private updatePostByBlogIdUseCase: UpdatePostByBlogIdSqlUseCase,
    private deletePostByIdSqlUseCase: DeletePostByIdSqlUseCase,
    private postsQueryRepository: PostsQuerySqlRepository,
  ) {}

  /////////////////////////////////// USERS ///////////////////////////////////
  @Get(`/users`)
  @UseGuards(AuthGuard)
  getAllUsers(@Query() query: any) {
    return this.usersSqlQueryRepository.getAllUsers(
      query.pageSize && Number(query.pageSize),
      query.pageNumber && Number(query.pageNumber),
      query.sortBy,
      query.sortDirection === 'asc' ? SortType.asc : SortType.desc,
      query.searchEmailTerm,
      query.searchLoginTerm,
    );
  }

  @Post(`/users`)
  @UseGuards(AuthGuard)
  async createUser(@Body() createUserDto: CreateUserDto) {
    const createdUser = await this.createUserSqlUseCase.execute(createUserDto);
    return createdUser.createdUser;
  }

  @Delete(`/users/:userId`)
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param(`userId`) userId: string) {
    return this.deleteUserSqlUseCase.execute(userId);
  }

  /////////////////////////////////// BLOGS ///////////////////////////////////
  @Get(`/posts`)
  @UseGuards(AuthGuard)
  async getAllPosts(@Query() query: any) {
    return this.blogsQueryRepository.getAllBlogs(
      query?.pageSize && Number(query.pageSize),
      query?.pageNumber && Number(query.pageNumber),
      query?.sortBy && query.sortBy,
      query?.sortDirection === 'asc' ? SortType.asc : SortType.desc,
      query?.searchNameTerm && query.searchNameTerm,
    );
  }

  @Get(`/blogs`)
  @UseGuards(AuthGuard)
  async getAllBlogs(@Query() query: any) {
    return this.blogsQueryRepository.getAllBlogs(
      query?.pageSize && Number(query.pageSize),
      query?.pageNumber && Number(query.pageNumber),
      query?.sortBy && query.sortBy,
      query?.sortDirection === 'asc' ? SortType.asc : SortType.desc,
      query?.searchNameTerm && query.searchNameTerm,
    );
  }

  @Post(`/blogs`)
  @UseGuards(AuthGuard)
  async createBlog(@Body() creatBlogDto: CreateBlogDto) {
    return this.createBlogSaSqlUseCase.execute(creatBlogDto);
  }

  @Put(`/blogs/:id`)
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param(`id`) blogId: string,
    @Body() updateBlogDto: CreateBlogDto,
  ) {
    return await this.updateBlogSaSqlUseCase.execute(blogId, updateBlogDto);
  }

  @Delete(`/blogs/:id`)
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param(`id`) blogId: string) {
    return await this.deleteBlogSaSqlUseCase.execute(blogId);
  }

  /////////////////////////////////// POSTS ///////////////////////////////////

  @Get(`/blogs/:id/posts`)
  @UseGuards(AuthGuard)
  async getAllPostsByBlogId(@Param(`id`) blogId: string, @Query() query: any) {
    return await this.postsQueryRepository.getAllPostsByBlogId(
      blogId,
      query?.pageNumber && Number(query.pageNumber),
      query?.pageSize && Number(query.pageSize),
      query?.sortDirection === 'asc' ? SortType.asc : SortType.desc,
      query?.sortBy && query.sortBy,
    );
  }

  @Post(`/blogs/:id/posts`)
  @UseGuards(AuthGuard)
  async createPostByBlogId(
    @Param(`id`) blogId: string,
    @Body() createPostInBlogDto: CreatePostInBlogDto,
  ) {
    return this.createPostByBlogIdSqlUseCase.execute(
      blogId,
      createPostInBlogDto,
    );
  }

  @Put(`/blogs/:blogId/posts/:postId`)
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param(`blogId`) blogId: string,
    @Param(`postId`) postId: string,
    @Body() updatePostDto: CreatePostInBlogDto,
  ) {
    return await this.updatePostByBlogIdUseCase.execute(
      blogId,
      postId,
      updatePostDto,
    );
  }

  @Delete(`/blogs/:blogId/posts/:postId`)
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostById(
    @Param(`blogId`) blogId: string,
    @Param(`postId`) postId: string,
  ) {
    return await this.deletePostByIdSqlUseCase.execute(blogId, postId);
  }
}
