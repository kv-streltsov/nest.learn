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
import { UsersQueryRepository } from './users.query.repository';
import { SortType } from './users.interface';
import { CreateUserDto } from './dto/create-users.dto';
import { AuthGuard } from '../../helpers/auth.guard';
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  getUsers(@Query() query: any) {
    try {
      return this.usersQueryRepository.getAllUsers(
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
    const createdUser = await this.usersService.createUser(createUserDto, true);
    return createdUser.createdUser;
  }

  @Delete(`:id`)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param(`id`) userId: string) {
    const deletedUser = await this.usersService.deleteUser(userId);
    if (deletedUser === null) {
      throw new NotFoundException('User not found');
    }
    return deletedUser;
  }
}
