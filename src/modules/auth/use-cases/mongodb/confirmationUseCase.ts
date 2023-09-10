import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersQueryRepository } from '../../../users/repositories/mongodb/users.query.repository';
import { UsersRepository } from '../../../users/repositories/mongodb/users.repository';
import { UsersSqlQueryRepository } from '../../../users/repositories/postgresql/users.sql.query.repository';
import { UsersSqlRepository } from '../../../users/repositories/postgresql/users.sql.repository';

export type JwrPairDto = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class ConfirmationUserUseCase {
  constructor(
    private usersQueryRepository: UsersSqlQueryRepository,
    private usersRepository: UsersSqlRepository,
  ) {}
  async execute(code: string) {
    const foundUser: any =
      await this.usersQueryRepository.getUserByConfirmationCode(code);

    if (foundUser === null || foundUser.confirmation.isConfirm === true) {
      throw new BadRequestException(`wrong code confirm`);
    }

    await this.usersRepository.updateConfirmationCode(code, {
      'confirmation.isConfirm': true,
      'confirmation.code': null,
    });
    return true;
  }
}
