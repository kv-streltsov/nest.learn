import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-users.dto';
import bcrypt from 'bcrypt';
import { UsersQueryRepository } from './users.query.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async deleteUser(userId: string) {
    const deletedUser = await this.usersRepository.deleteUser(userId);
    if (deletedUser.deletedCount === 0) {
      return null;
    }
    return deletedUser;
  }

  // async findUserByLoginOrEmail(loginOrEmail: string, password: string) {
  //   const foundUser = await this.usersQueryRepository.getUserByLoginOrEmail(
  //     loginOrEmail,
  //   );
  //   if (foundUser === null) {
  //     return null;
  //   }
  //
  //   const passwordHash: string = await this._generateHash(
  //     password,
  //     foundUser.salt,
  //   );
  //
  //   if (passwordHash !== foundUser.password) {
  //     return false;
  //   }
  //   return foundUser;
  // }

  // async _generatePasswordHash(password: string) {
  //   const salt: string = await bcrypt.genSalt(10);
  //   const passwordHash: string = await this._generateHash(password, salt);
  //   return { salt, passwordHash };
  // }

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
