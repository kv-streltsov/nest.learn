import { IsEnum } from 'class-validator';

export enum LikeStatusEnum {
  None = `None`,
  Like = `Like`,
  Dislike = `Dislike`,
}
export class LikeInputDto {
  @IsEnum(LikeStatusEnum)
  public likeStatus: LikeStatusEnum;
}
