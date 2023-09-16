import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersQueryRepository } from '../../../users/repositories/mongodb/users.query.repository';
@Injectable()
export class GetMeInfoUseCase {
  constructor(private usersQueryRepository: UsersQueryRepository) {}
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
