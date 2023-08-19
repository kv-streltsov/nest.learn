import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 10)
  @Matches(`^[a-zA-Z0-9_-]*$`)
  public login: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 20)
  public password: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @Matches(`^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$`)
  public email: string;
}
