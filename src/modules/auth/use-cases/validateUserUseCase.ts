import { Injectable } from '@nestjs/common';
import { UsersQueryRepository } from '../../users/users.query.repository';
import bcrypt from 'bcrypt';

@Injectable()
export class ValidateUserUseCase {
  constructor(private usersQueryRepository: UsersQueryRepository) {}
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
