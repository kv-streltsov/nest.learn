import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-users.dto';
import bcrypt from 'bcrypt';
import { UsersSqlQueryRepository } from './repositories/postgresql/users.sql.query.repository';

@Injectable()
export class UsersSqlService {
  constructor(
    private readonly usersSqlQueryRepository: UsersSqlQueryRepository,
  ) {}

  public async generateHash(password: string, salt: string) {
    return await bcrypt.hash(password, salt);
  }
  public async checkUserExist(userRegistrationDto: CreateUserDto) {
    const isEmailExist =
      await this.usersSqlQueryRepository.getUserByLoginOrEmail(
        userRegistrationDto.email,
      );
    const isLoginExist =
      await this.usersSqlQueryRepository.getUserByLoginOrEmail(
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
