import { Injectable } from '@nestjs/common';
import { SortType } from '../../users.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../user.entity';
import { Repository } from 'typeorm';
@Injectable()
export class UsersSqlQueryRepository {
  private DEFAULT_SORT_FIELD = 'createdAt';

  constructor(
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
    const { countItems, sortDirectionString, searchTerm, count } =
      await this.paginationHandler(
        pageNumber,
        pageSize,
        sortDirection,
        searchEmailTerm,
        searchLoginTerm,
      );

    const foundUsers = await this.usersSqlRepository.query(
      `SELECT CAST(id AS VARCHAR), login, email,  "createdAt"
                FROM public.users
                ${searchTerm}
                ORDER BY "${sortBy}" ${
        sortBy === 'createdAt' ? '' : 'COLLATE "C"'
      } ${sortDirectionString}
                LIMIT ${pageSize} OFFSET ${countItems}`,
    );

    return {
      pagesCount: Math.ceil(count / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: count,
      items: foundUsers,
    };
  }
  async getUserById(userId: string) {
    const foundUser = await this.usersSqlRepository.query(
      `SELECT id, login, email, "createdAt",  confirmation
                FROM public.users 
                WHERE id = $1`,
      [userId],
    );
    return foundUser[0];
  }
  async getUserByLoginOrEmail(loginOrEmail: string) {
    const foundUser = await this.usersSqlRepository.query(
      `SELECT id, login, email, password, "createdAt", salt, confirmation
                FROM public.users
                WHERE login = $1 or email = $1;`,
      [loginOrEmail],
    );
    if (foundUser.length === 0) return null;
    return foundUser[0];
  }
  async getUserByConfirmationCode(code: string) {
    const foundUser = await this.usersSqlRepository.query(
      `SELECT id, login, email, password, "createdAt", salt, confirmation
        FROM public.users
        WHERE confirmation ->> 'code' = $1`,
      [code],
    );
    if (foundUser.length === 0) return null;
    return foundUser[0];
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
      searchTerm = `WHERE "email" ILIKE '%${searchEmailTerm}%'`;
    } else if (searchEmailTerm === null && searchLoginTerm !== null) {
      searchTerm = `WHERE "login" ILIKE '%${searchLoginTerm}%'`;
    } else if (searchEmailTerm !== null && searchLoginTerm !== null) {
      searchTerm = `WHERE "login" ILIKE '%${searchLoginTerm}%' OR "email" ILIKE '%${searchEmailTerm}%'`;
    }

    const count: number = await this.usersSqlRepository
      .query(
        `SELECT COUNT(*) 
                        FROM public.users
                        ${searchTerm}`,
      )
      .then((data) => {
        return parseInt(data[0].count);
      });

    return {
      countItems,
      sortDirectionString,
      searchTerm,
      count,
    };
  }
}
