import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../dto/create-users.dto';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { ModifiedUserDto } from '../../dto/update-users.dto';
import { UsersSqlRepository } from '../../repositories/postgresql/users.sql.repository';
import { UsersSqlService } from '../../users.sql.service';
import { UsersSqlQueryRepository } from '../../repositories/postgresql/users.sql.query.repository';

@Injectable()
export class CreateUserSqlUseCase {
  constructor(
    private usersSqlRepository: UsersSqlRepository,
    private usersSqlService: UsersSqlService,
    private usersSqlQueryRepository: UsersSqlQueryRepository,
  ) {}
  async execute(createUserDto: CreateUserDto, confirmAdmin = false) {
    await this.usersSqlService.checkUserExist(createUserDto);

    const salt: string = await bcrypt.genSalt(10);
    const passwordHash: string = await this.usersSqlService.generateHash(
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
        id: foundUser[0].id.toString(),
        login: foundUser[0].login,
        email: foundUser[0].email,
        createdAt: foundUser[0].createdAt,
      },
      uuid,
    };
  }
}
