import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersSqlQueryRepository } from '../../../users/repositories/postgresql/users.sql.query.repository';
import { CommandHandler } from '@nestjs/cqrs';

export class GetMeInfoUseSqlCaseCommand {
  constructor(public userId: string) {}
}
@CommandHandler(GetMeInfoUseSqlCaseCommand)
export class GetMeInfoUseSqlCase {
  constructor(private usersQueryRepository: UsersSqlQueryRepository) {}
  async execute(command: GetMeInfoUseSqlCaseCommand) {
    const foundUser = await this.usersQueryRepository.getUserById(
      command.userId,
    );
    if (!foundUser) {
      throw new UnauthorizedException();
    }
    return {
      email: foundUser.email,
      login: foundUser.login,
      userId: foundUser.id,
    };
  }
}
