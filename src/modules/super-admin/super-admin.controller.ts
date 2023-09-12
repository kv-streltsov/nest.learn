import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
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
@Controller('sa')
export class SuperAdminController {
  constructor(
    private blogsQueryRepository: BlogsQuerySqlRepository,
    private createBlogSaSqlUseCase: CreateBlogSaSqlUseCase,
    private createUserSqlUseCase: CreateUserSqlUseCase,
    private deleteUserSqlUseCase: DeleteUserSqlUseCase,
    private usersSqlQueryRepository: UsersSqlQueryRepository,
    private updateBlogSaSqlUseCase: UpdateBlogSaSqlUseCase,
    private deleteBlogSaSqlUseCase: DeleteBlogSaSqlUseCase,
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
  @Get()
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
}
