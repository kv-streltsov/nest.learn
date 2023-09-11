import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { UsersSqlQueryRepository } from '../../../users/repositories/postgresql/users.sql.query.repository';
import { UsersQueryRepository } from '../../../users/repositories/mongodb/users.query.repository';
@Injectable()
export class ValidateUserUseCase {
  constructor(private usersQueryRepository: UsersSqlQueryRepository) {}
  async execute(loginOrEmail: string, password: string) {
    const foundUser = await this.usersQueryRepository.getUserByLoginOrEmail(
      loginOrEmail,
    );
    if (foundUser === null) {
      return null;
    }
    const passwordHash: string = await bcrypt.hash(password, foundUser.salt);
    if (passwordHash !== foundUser.password) {
      return false;
    }
    return foundUser;
  }
}
