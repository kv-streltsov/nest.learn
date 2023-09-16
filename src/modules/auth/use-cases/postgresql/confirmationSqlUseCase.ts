import { BadRequestException } from '@nestjs/common';
import { UsersSqlQueryRepository } from '../../../users/repositories/postgresql/users.sql.query.repository';
import { UsersSqlRepository } from '../../../users/repositories/postgresql/users.sql.repository';
import { CommandHandler } from '@nestjs/cqrs';
export type JwrPairDto = {
  accessToken: string;
  refreshToken: string;
};

export class ConfirmationUserSqlUseCaseCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmationUserSqlUseCaseCommand)
export class ConfirmationUserSqlUseCase {
  constructor(
    private usersQueryRepository: UsersSqlQueryRepository,
    private usersRepository: UsersSqlRepository,
  ) {}
  async execute(command: ConfirmationUserSqlUseCaseCommand) {
    const foundUser: any =
      await this.usersQueryRepository.getUserByConfirmationCode(command.code);

    if (foundUser === null || foundUser.confirmation.isConfirm === true) {
      throw new BadRequestException(`wrong code confirm`);
    }

    await this.usersRepository.updateConfirmationCode(command.code, {
      'confirmation.isConfirm': true,
      'confirmation.code': null,
    });
    return true;
  }
}
