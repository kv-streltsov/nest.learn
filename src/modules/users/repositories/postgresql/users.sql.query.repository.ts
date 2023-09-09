import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from '../../users.schema';
import { Model } from 'mongoose';
import { SortBanStatus, SortType } from '../../users.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersSqlQueryRepository {
  private DEFAULT_SORT_FIELD = 'createdAt';

  constructor(
    @InjectModel(Users.name) private usersModel: Model<Users>,
    @InjectRepository(UserEntity)
    private readonly usersSqlRepository: Repository<UserEntity>,
  ) {}

  async getAllUsers(
    pageSize = 10,
    pageNumber = 1,
    sortBy: string = this.DEFAULT_SORT_FIELD,
    sortDirection: number,
    searchEmailTerm: string | null = null,
    searchLoginTerm: string | null = null,
  ): Promise<any> {
    const { countItems, sortDirectionString, searchTerm } =
      await this.paginationHandler(
        pageNumber,
        pageSize,
        sortDirection,
        searchEmailTerm,
        searchLoginTerm,
      );
    const foundUsers = await this.usersSqlRepository.query(
      `SELECT CAST(id AS VARCHAR) AS id, login, email,  "createdAt"
                FROM public.users
                ${searchTerm}
                ORDER BY "${sortBy}" ${sortDirectionString}`,
    );

    const count = foundUsers.length;

    return {
      pagesCount: Math.ceil(count / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: count,
      items: foundUsers,
    };
  }
  async getUserById(userId: string) {
    return this.usersModel.findOne({ id: userId }).lean();
  }
  async getUserByLoginOrEmail(loginOrEmail: string) {
    const foundUser = await this.usersSqlRepository.query(
      `SELECT id, login, email, password, "createdAt", salt, confirmation
                FROM public.users
                WHERE login = $1 or email = $1;`,
      [loginOrEmail],
    );
    if (foundUser.length === 0) return null;
    return foundUser;
  }
  async getUserByConfirmationCode(code: string) {
    return this.usersModel.findOne({ 'confirmation.code': code }).lean();
  }
  private async paginationHandler(
    pageNumber: number,
    pageSize: number,
    sortDirection: number,
    searchEmailTerm: string | null,
    searchLoginTerm: string | null,
  ) {
    const countItems = (pageNumber - 1) * pageSize;

    const sortDirectionString = SortType[sortDirection];

    let searchTerm = {};
    if (searchEmailTerm === null && searchLoginTerm === null) {
      searchTerm = '';
    } else if (searchLoginTerm === null && searchEmailTerm !== null) {
      searchTerm = `WHERE "email" LIKE '%${searchEmailTerm}%'`;
    } else if (searchEmailTerm === null && searchLoginTerm !== null) {
      searchTerm = `WHERE "login" LIKE '%${searchLoginTerm}%'`;
    } else if (searchEmailTerm !== null && searchLoginTerm !== null) {
      searchTerm = `WHERE "login" LIKE '%${searchLoginTerm}%' OR WHERE "email" LIKE '%${searchEmailTerm}%'`;
    }

    return {
      countItems,
      sortDirectionString,
      searchTerm,
    };
  }
}
