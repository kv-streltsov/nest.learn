import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../users.repository';

@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}
  async execute(userId: string) {
    const deletedUser = await this.usersRepository.deleteUser(userId);
    if (deletedUser.deletedCount === 0) {
      throw new NotFoundException();
    }
    return true;
  }
}
