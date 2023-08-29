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
import { CreateUserUseCase } from '../users/use-cases/createUserUseCase';
import { DeleteUserUseCase } from '../users/use-cases/deleteUserUseCase';
import { UsersQueryRepository } from '../users/users.query.repository';
import { BanUserDto } from '../security-devices/dto/ban-user.dto';
import { BanUserUseCase } from './use-cases/banUserUseCase';

@Controller('sa')
export class SuperAdminController {
  constructor(
    private bindBlogWithUserUseCase: BindBlogWithUserUseCase,
    private bloggerQueryRepository: BloggerQueryRepository,
    private usersQueryRepository: UsersQueryRepository,
    private createUserUseCase: CreateUserUseCase,
    private deleteUserUseCase: DeleteUserUseCase,
    private banUserUseCase: BanUserUseCase,
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
  banUser(@Param(`userId`) userId: string, @Body() banUserDto: BanUserDto) {
    return this.banUserUseCase.execute(userId, banUserDto);
  }

  @Get(`/users`)
  @UseGuards(AuthGuard)
  getAllUsers(@Query() query: any) {
    return this.usersQueryRepository.getAllUsers(
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
    const createdUser = await this.createUserUseCase.execute(createUserDto);
    return createdUser.createdUser;
  }

  @Delete(`/users/:userId`)
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param(`userId`) userId: string) {
    return this.deleteUserUseCase.execute(userId);
  }
}
