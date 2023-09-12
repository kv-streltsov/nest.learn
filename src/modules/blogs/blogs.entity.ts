import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BlogsEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ default: true })
  ownerId: number;

  @Column({ default: true })
  name: string;

  @Column({ default: true })
  description: string;

  @Column({ default: true })
  websiteUrl: string;

  @Column({ default: true })
  createdAt: string;

  @Column({ default: true })
  isMembership: boolean;
}
