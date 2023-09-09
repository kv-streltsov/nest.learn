import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../dto/create-users.dto';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { ModifiedUserDto } from '../../dto/update-users.dto';
import { UsersRepository } from '../../repositories/mongodb/users.repository';
import { UsersService } from '../../users.service';
import { UsersSqlRepository } from '../../repositories/postgresql/users.sql.repository';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersSqlRepository: UsersSqlRepository,
    private usersService: UsersService,
  ) {}
  async execute(createUserDto: CreateUserDto, confirmAdmin = false) {
    await this.usersService.checkUserExist(createUserDto);

    const salt: string = await bcrypt.genSalt(10);
    const passwordHash: string = await this.usersService.generateHash(
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
      // banInfo: {
      //   isBanned: false,
      //   banDate: null,
      //   banReason: null,
      // },
    };

    const createdUser = await this.usersRepository.createUser(createUserData);
    return {
      createdUser: {
        id: createdUser.id,
        login: createdUser.login,
        email: createdUser.email,
        createdAt: createdUser.createdAt,
        banInfo: createdUser.banInfo,
      },
      uuid,
    };
  }
}
