import { IsString, Length } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class CommentInputDto {
  @IsString()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @Length(20, 300)
  public content: string;
}
