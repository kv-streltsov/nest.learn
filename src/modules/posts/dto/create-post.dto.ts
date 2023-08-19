import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { isBlogExist } from '../../../helpers/custom-validators/custom.validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @MaxLength(30)
  title: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @MaxLength(100)
  shortDescription: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @MaxLength(1000)
  content: string;

  @IsString()
  @isBlogExist()
  blogId: string;
}

export class CreatePostInBlogDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @MaxLength(30)
  title: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @MaxLength(100)
  shortDescription: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @MaxLength(1000)
  content: string;
}

export interface ICreateModifiedPostDto {
  id: string;
  blogId: string;
  blogName: string;
  title: string;
  shortDescription: string;
  content: string;
  createdAt: string;
}
