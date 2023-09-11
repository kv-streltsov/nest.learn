import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersQueryRepository } from '../../../users/repositories/mongodb/users.query.repository';
import { UsersSqlQueryRepository } from '../../../users/repositories/postgresql/users.sql.query.repository';
@Injectable()
export class GetMeInfoUseCase {
  constructor(private usersQueryRepository: UsersSqlQueryRepository) {}
  async execute(userId: string) {
    const foundUser = await this.usersQueryRepository.getUserById(userId);
    if (!foundUser) {
      throw new UnauthorizedException();
    }
    return {
      email: foundUser.email,
      login: foundUser.login,
      userId,
    };
  }
}
