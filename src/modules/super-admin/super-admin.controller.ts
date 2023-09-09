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
import { CreateUserSqlUseCase } from '../users/use-cases/postgresql/createUserSqlUseCase';
import { DeleteUserSqlUseCase } from '../users/use-cases/postgresql/deleteUserSqlUseCase';
import { UsersSqlQueryRepository } from '../users/repositories/postgresql/users.sql.query.repository';

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
    const createdUser = await this.createUserSqlUseCase.execute(createUserDto);
    return createdUser.createdUser;
  }

  @Delete(`/users/:userId`)
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param(`userId`) userId: string) {
    return this.deleteUserSqlUseCase.execute(userId);
  }
}
