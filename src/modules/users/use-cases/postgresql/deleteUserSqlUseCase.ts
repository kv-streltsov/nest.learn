import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersSqlRepository } from '../../repositories/postgresql/users.sql.repository';

@Injectable()
export class DeleteUserSqlUseCase {
  constructor(private readonly usersSqlRepository: UsersSqlRepository) {}
  async execute(userId: string) {
    const deletedUser = await this.usersSqlRepository.deleteUser(userId);
    if (deletedUser[1] === 0) {
      throw new NotFoundException();
    }
    return true;
  }
}
