import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-users.dto';
import bcrypt from 'bcrypt';
import { UsersQueryRepository } from './users.query.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}

  public async generateHash(password: string, salt: string) {
    return await bcrypt.hash(password, salt);
  }
  public async checkUserExist(userRegistrationDto: CreateUserDto) {
    const isEmailExist = await this.usersQueryRepository.getUserByLoginOrEmail(
      userRegistrationDto.email,
    );
    const isLoginExist = await this.usersQueryRepository.getUserByLoginOrEmail(
      userRegistrationDto.login,
    );
    if (isEmailExist !== null && isLoginExist !== null) {
      throw new BadRequestException([
        { message: `login exist`, filed: `login` },
        { message: `email exist`, filed: `email` },
      ]);
    }
    if (isEmailExist !== null && isLoginExist === null) {
      throw new BadRequestException(`email exist`);
    }
    if (isEmailExist === null && isLoginExist !== null) {
      throw new BadRequestException(`login exist`);
    }
  }
}
