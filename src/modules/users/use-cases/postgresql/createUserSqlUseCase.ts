import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../dto/create-users.dto';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { ModifiedUserDto } from '../../dto/update-users.dto';
import { UsersSqlRepository } from '../../repositories/postgresql/users.sql.repository';
import { UsersSqlQueryRepository } from '../../repositories/postgresql/users.sql.query.repository';
import { UsersService } from '../../users.service';
@Injectable()
export class CreateUserSqlUseCase {
  constructor(
    private usersSqlRepository: UsersSqlRepository,
    private usersService: UsersService,
    private usersSqlQueryRepository: UsersSqlQueryRepository,
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
    };

    await this.usersSqlRepository.createUser(createUserData);
    const foundUser = await this.usersSqlQueryRepository.getUserByLoginOrEmail(
      createUserData.login,
    );
    return {
      createdUser: {
        id: foundUser.id.toString(),
        login: foundUser.login,
        email: foundUser.email,
        createdAt: foundUser.createdAt,
      },
      uuid,
    };
  }
}
