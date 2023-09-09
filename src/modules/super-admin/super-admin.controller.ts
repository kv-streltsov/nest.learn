import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../helpers/auth.guard';
import { CreateUserDto } from '../users/dto/create-users.dto';
import { SortType } from '../users/users.interface';
import { UsersQueryRepository } from '../users/users.query.repository';
import { CreateUserSqlUseCase } from '../users/use-cases/createUserSqlUseCase';
import { DeleteUserSqlUseCase } from '../users/use-cases/deleteUserSqlUseCase';
import { UsersSqlQueryRepository } from '../users/users.sql.query.repository';

@Controller('sa')
export class SuperAdminController {
  constructor(
    private createUserSqlUseCase: CreateUserSqlUseCase,
    private deleteUserSqlUseCase: DeleteUserSqlUseCase,
    private usersSqlQueryRepository: UsersSqlQueryRepository,
  ) {}

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
    return this.createUserSqlUseCase.execute(createUserDto);
  }

  @Delete(`/users/:userId`)
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param(`userId`) userId: string) {
    return this.deleteUserSqlUseCase.execute(userId);
  }

  // // BLOGS
  // @Put(`/blogs/:blogId/bind-with-user/:userId`)
  // @UseGuards(AuthGuard)
  // @HttpCode(HttpStatus.NO_CONTENT)
  // bindBlogWithUser(
  //   @Param(`blogId`) blogId: string,
  //   @Param(`userId`) userId: string,
  // ) {
  //   return this.bindBlogWithUserUseCase.execute(blogId, userId);
  // }
  //
  // @Get(`/blogs`)
  // @UseGuards(AuthGuard)
  // async getAllBlogs(@Query() query: any) {
  //   return this.bloggerQueryRepository.getAllBlogs(
  //     query?.pageNumber && Number(query.pageNumber),
  //     query?.pageSize && Number(query.pageSize),
  //     query?.sortDirection === 'asc' ? SortType.asc : SortType.desc,
  //     query?.sortBy && query.sortBy,
  //     query?.searchNameTerm && query.searchNameTerm,
  //   );
  // }
  //
  // // USERS
  // @Put(`/users/:userId/ban`)
  // @UseGuards(AuthGuard)
  // @HttpCode(HttpStatus.NO_CONTENT)
  // banUser(@Param(`userId`) userId: string, @Body() banUserDto: BanUserDto) {
  //   return this.banUserUseCase.execute(userId, banUserDto);
  // }
}
