import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true })
  login: string;

  @Column({ default: true })
  email: string;

  @Column({ default: true })
  password: string;

  @Column({ default: true })
  createdAt: string;

  @Column({ default: true })
  salt: string;

  @Column({ default: true })
  confirmation: object;
}
