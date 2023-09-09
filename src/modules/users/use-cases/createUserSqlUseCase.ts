import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-users.dto';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { ModifiedUserDto } from '../dto/update-users.dto';
import { UsersService } from '../users.service';
import { UsersSqlRepository } from '../users.sql.repository';
import { UsersSqlService } from '../users.sql.service';

@Injectable()
export class CreateUserSqlUseCase {
  constructor(
    private readonly usersSqlRepository: UsersSqlRepository,
    private usersSqlService: UsersSqlService,
    private usersService: UsersService,
  ) {}
  async execute(createUserDto: CreateUserDto, confirmAdmin = false) {
    await this.usersSqlService.checkUserExist(createUserDto);

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

    return this.usersSqlRepository.createUser(createUserData);
  }
}
