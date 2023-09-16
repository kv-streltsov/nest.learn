import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CommentsEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ default: true })
  entityId: string;

  @Column({ default: true })
  content: string;

  @Column({ default: true })
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };

  @Column({ default: true })
  createdAt: string;
}
