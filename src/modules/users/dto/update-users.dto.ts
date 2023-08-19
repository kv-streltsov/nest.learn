import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-users.dto';
// confirmation  {
//   code: uuid,
//     wasConfirm: confirmAdmin,
// }
export class UpdateUserDto extends PartialType(CreateUserDto) {}
export class ModifiedUserDto extends PartialType(CreateUserDto) {
  readonly id: string;
  readonly login: string;
  readonly password: string;
  readonly email: string;
  readonly createdAt: string;
  readonly salt: string;
  readonly confirmation: {
    code: string | null;
    isConfirm: boolean;
  };
}
