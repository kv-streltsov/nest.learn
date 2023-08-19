import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-users.dto';
import { randomUUID } from 'crypto';
import { ModifiedUserDto } from './dto/update-users.dto';
import bcrypt from 'bcrypt';
import { UsersQueryRepository } from './users.query.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}
  async createUser(createUserDto: CreateUserDto, confirmAdmin = false) {
    await this._checkUserExist(createUserDto);

    const salt: string = await bcrypt.genSalt(10);
    const passwordHash: string = await this._generateHash(
      createUserDto.password,
      salt,
    );
    const uuid: string = randomUUID();
    const createUserData: ModifiedUserDto = {
      id: randomUUID(),
      login: createUserDto.login,
      email: createUserDto.email,
      password: passwordHash,
      createdAt: new Date().toISOString(),
      salt,
      confirmation: {
        code: confirmAdmin ? null : uuid,
        isConfirm: confirmAdmin,
      },
    };

    const createdUser = await this.usersRepository.createUser(createUserData);

    return {
      createdUser: {
        id: createdUser.id,
        login: createdUser.login,
        email: createdUser.email,
        createdAt: createdUser.createdAt,
      },
      uuid,
    };
  }

  async deleteUser(userId: string) {
    const deletedUser = await this.usersRepository.deleteUser(userId);
    if (deletedUser.deletedCount === 0) {
      return null;
    }
    return deletedUser;
  }

  async findUserByLoginOrEmail(loginOrEmail: string, password: string) {
    const foundUser = await this.usersQueryRepository.getUserByLoginOrEmail(
      loginOrEmail,
    );
    if (foundUser === null) {
      return null;
    }

    const passwordHash: string = await this._generateHash(
      password,
      foundUser.salt,
    );

    if (passwordHash !== foundUser.password) {
      return false;
    }
    return foundUser;
  }

  async _generatePasswordHash(password: string) {
    const salt: string = await bcrypt.genSalt(10);
    const passwordHash: string = await this._generateHash(password, salt);
    return { salt, passwordHash };
  }

  async _generateHash(password: string, salt: string) {
    return await bcrypt.hash(password, salt);
  }

  async _checkUserExist(userRegistrationDto: CreateUserDto) {
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
