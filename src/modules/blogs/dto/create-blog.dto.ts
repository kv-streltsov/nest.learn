import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @MaxLength(15)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @MaxLength(500)
  description: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @MaxLength(100)
  @Matches(
    `^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$`,
  )
  websiteUrl: string;
}

export interface ICreateBlogModifiedDto {
  ownerId: string | null;
  id: string;
  createdAt: string;
  isMembership: boolean;
  name: string;
  description: string;
  websiteUrl: string;
}
