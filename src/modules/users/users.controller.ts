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
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersQueryRepository } from './repositories/mongodb/users.query.repository';
import { SortType } from './users.interface';
import { CreateUserDto } from './dto/create-users.dto';
import { AuthGuard } from '../../helpers/auth.guard';
import { CreateUserUseCase } from './use-cases/mongodb/createUserUseCase';
import { DeleteUserUseCase } from './use-cases/mongodb/deleteUserUseCase';
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
    private createUserUseCase: CreateUserUseCase,
    private deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Get()
  getUsers(@Query() query: any) {
    try {
      return this.usersQueryRepository.getAllUsers(
        `all`,
        query.pageSize && Number(query.pageSize),
        query.pageNumber && Number(query.pageNumber),
        query.sortBy,
        query.sortDirection === 'asc' ? SortType.asc : SortType.desc,
        query.searchEmailTerm,
        query.searchLoginTerm,
      );
    } catch (error) {
      return error;
    }
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    const createdUser = await this.createUserUseCase.execute(
      createUserDto,
      true,
    );
    return createdUser.createdUser;
  }

  @Delete(`:id`)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param(`id`) userId: string) {
    const deletedUser = await this.deleteUserUseCase.execute(userId);
    if (deletedUser === null) {
      throw new NotFoundException('User not found');
    }
    return deletedUser;
  }
}
