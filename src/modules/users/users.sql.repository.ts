import { Injectable } from '@nestjs/common';
import { ModifiedUserDto } from './dto/update-users.dto';

@Injectable()
export class UsersRepository {
  constructor() {}
  createUser(userDto: ModifiedUserDto) {
    return `this.userModel.create(userDto);`;
  }
}
