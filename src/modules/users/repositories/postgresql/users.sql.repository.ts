import { Injectable } from '@nestjs/common';
import { ModifiedUserDto } from '../../dto/update-users.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity} from '../../user.entity';
@Injectable()
export class UsersSqlRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userSqlRepository: Repository<UserEntity>,
  ) {}
  async createUser(userDto: ModifiedUserDto) {
    return this.userSqlRepository.query(
      `INSERT INTO public.users(
             "login", "email", "password", "createdAt", "salt", "confirmation")
              VALUES ($1, $2, $3, $4, $5, $6); `,
      [
        userDto.login,
        userDto.email,
        userDto.password,
        userDto.createdAt,
        userDto.salt,
        userDto.confirmation,
      ],
    );
  }
  async updateConfirmationCode(code: string, pyload: any) {
    return this.userSqlRepository.query(
      `UPDATE public.users
                SET confirmation = confirmation  || '{"code":"${pyload['confirmation.code']}", "isConfirm":"${pyload['confirmation.isConfirm']}"}' 
                WHERE confirmation ->> 'code' = '${code}'`,
    );
  }
  async updateConfirmationCodeByEmail(email: string, uuid: string) {
    return this.userSqlRepository.query(
      `UPDATE public.users
                SET confirmation = confirmation  || '{"code":"${uuid}"}' 
                WHERE email = '${email}'`,
    );
  }
  deleteUser(userId: string) {
    return this.userSqlRepository.query(
      `DELETE FROM public.users
            WHERE "id"=$1;`,
      [userId],
    );
  }
}
