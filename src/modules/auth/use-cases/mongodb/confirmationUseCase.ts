import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersQueryRepository } from '../../../users/repositories/mongodb/users.query.repository';
import { UsersRepository } from '../../../users/repositories/mongodb/users.repository';
export type JwrPairDto = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class ConfirmationUserUseCase {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private usersRepository: UsersRepository,
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
