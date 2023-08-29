import { IsBoolean, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class BanUserDto {
  @IsBoolean()
  @IsNotEmpty()
  isBanned: boolean;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @MinLength(20)
  banReason: string;
}
