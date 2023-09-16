import { Column, Entity } from 'typeorm';
import { LikeStatusEnum } from './dto/create-like.dto';

@Entity()
export class LikesEntity {
  @Column({ default: true })
  entityId: string;

  @Column({ default: true })
  userId: string;

  @Column({ type: 'enum', enum: LikeStatusEnum, default: true })
  status: string;

  @Column({ default: true })
  addedAt: string;
}
