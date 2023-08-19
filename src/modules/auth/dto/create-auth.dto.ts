import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class EmailPasswordRecoveryDto {
  @IsString()
  @IsEmail()
  @Matches(`^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$`)
  public email: string;
}

export class RegistrationEmailResendingDto {
  @IsEmail()
  @Matches(`^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$`)
  public email: string;
}

export class NewPasswordRecoveryDto {
  @IsString()
  @Length(6, 20)
  public newPassword: string;
  @IsString()
  public recoveryCode: string;
}

export class LoginInputDto {
  @IsString()
  public loginOrEmail: string;
  @IsString()
  public password: string;
}

export class RegistrationConfirmationCodeDto {
  @IsString()
  public code: string;
}
export class UserRegistrationDto {
  @IsString()
  @Length(3, 10)
  @Matches(`^[a-zA-Z0-9_-]*$`)
  public login: string;
  @IsString()
  @Length(6, 20)
  public password: string;
  @IsString()
  @Matches(`^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$`)
  public email: string;
}
