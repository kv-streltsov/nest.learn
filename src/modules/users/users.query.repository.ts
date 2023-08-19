import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from './users.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersQueryRepository {
  private DEFAULT_SORT_FIELD = 'createdAt';

  constructor(@InjectModel(Users.name) private usersModel: Model<Users>) {}

  async getAllUsers(
    pageSize = 10,
    pageNumber = 1,
    sortBy: string = this.DEFAULT_SORT_FIELD,
    sortDirection: number,
    searchEmailTerm: string | null = null,
    searchLoginTerm: string | null = null,
  ): Promise<any> {
    const { countItems, sortField, searchTerm } = this.paginationHandler(
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchEmailTerm,
      searchLoginTerm,
    );

    const count: number = await this.usersModel.countDocuments(searchTerm);

    const users = await this.usersModel
      .find(searchTerm)
      .select({ _id: 0, password: 0, salt: 0, confirmation: 0, __v: 0 })
      .sort(sortField)
      .skip(countItems)
      .limit(pageSize)
      .lean();

    return {
      pagesCount: Math.ceil(count / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: count,
      items: users,
    };
  }
  async getUserById(userId: string) {
    return this.usersModel.findOne({ id: userId }).lean();
  }
  async getUserByLoginOrEmail(loginOrEmail: string) {
    return this.usersModel
      .findOne({ $or: [{ email: loginOrEmail }, { login: loginOrEmail }] })
      .lean();
  }
  async getUserByConfirmationCode(code: string) {
    return this.usersModel.findOne({ 'confirmation.code': code }).lean();
  }

  paginationHandler(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: number,
    searchEmailTerm: string | null,
    searchLoginTerm: string | null,
  ) {
    const countItems = (pageNumber - 1) * pageSize;

    const sortField: any = {};
    sortField[sortBy] = sortDirection;

    let searchTerm = {};
    if (searchEmailTerm === null && searchLoginTerm === null) {
      searchTerm = {};
    } else if (searchLoginTerm === null && searchEmailTerm !== null) {
      searchTerm = { email: { $regex: searchEmailTerm, $options: 'i' } };
    } else if (searchEmailTerm === null && searchLoginTerm !== null) {
      searchTerm = { login: { $regex: searchLoginTerm, $options: 'i' } };
    } else if (searchEmailTerm !== null && searchLoginTerm !== null) {
      searchTerm = {
        $or: [
          { email: { $regex: searchEmailTerm, $options: 'i' } },
          { login: { $regex: searchLoginTerm, $options: 'i' } },
        ],
      };
    }

    return {
      countItems,
      sortField,
      searchTerm,
    };
  }
}
