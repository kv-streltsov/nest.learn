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
import { BindBlogWithUserUseCase } from './use-cases/bindBlogWithUserUseCase';
import { CreateUserDto } from '../users/dto/create-users.dto';
import { BloggerQueryRepository } from '../blogger/blogger.query.repository';
import { SortType } from '../users/users.interface';

@Controller('sa')
export class SuperAdminController {
  constructor(
    private bindBlogWithUserUseCase: BindBlogWithUserUseCase,
    private bloggerQueryRepository: BloggerQueryRepository,
  ) {}

  // BLOGS
  @Put(`/blogs/:blogId/bind-with-user/:userId`)
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  bindBlogWithUser(
    @Param(`blogId`) blogId: string,
    @Param(`userId`) userId: string,
  ) {
    return this.bindBlogWithUserUseCase.execute(blogId, userId);
  }

  @Get(`/blogs`)
  @UseGuards(AuthGuard)
  async getAllBlogs(@Query() query: any) {
    return this.bloggerQueryRepository.getAllBlogs(
      query?.pageNumber && Number(query.pageNumber),
      query?.pageSize && Number(query.pageSize),
      query?.sortDirection === 'asc' ? SortType.asc : SortType.desc,
      query?.sortBy && query.sortBy,
      query?.searchNameTerm && query.searchNameTerm,
    );
  }
  // USERS
  @Put(`/users/:userId/ban`)
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  banUser(@Param(`userId`) userId: string) {
    return userId;
  }

  @Get(`/users`)
  @UseGuards(AuthGuard)
  getAllUsers() {
    return `all blogs`;
  }

  @Post(`/users`)
  @UseGuards(AuthGuard)
  createUser(@Body() createUserDto: CreateUserDto) {
    return createUserDto;
  }

  @Delete(`/users/:userId`)
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param(`userId`) userId: string) {
    return userId;
  }
}
