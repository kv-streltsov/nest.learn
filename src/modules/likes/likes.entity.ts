import {Column, Entity, Generated, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn} from 'typeorm';
import { LikeStatusEnum } from './dto/create-like.dto';
import {UserEntity} from "../users/user.entity";

@Entity()
class Likes {
  @PrimaryColumn({type:"uuid"})
  @Generated("uuid") entityId: string;

  @OneToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity

  @Column({ type: 'enum', enum: LikeStatusEnum })
  status: string;

  @Column({ default: true })
  addedAt: string;
}
export { Likes as LikesEntity }
// -- Table: public.likes
//
// -- DROP TABLE IF EXISTS public.likes;
//
// CREATE TABLE IF NOT EXISTS public.likes
// (
//   "entityId" uuid NOT NULL,
//   "userId" uuid NOT NULL,
//   status text COLLATE pg_catalog."default" NOT NULL,
//   "addedAt" timestamp with time zone NOT NULL,
//   CONSTRAINT "like-user-fkey" FOREIGN KEY ("userId")
// REFERENCES public.users (id) MATCH SIMPLE
// ON UPDATE NO ACTION
// ON DELETE NO ACTION
// )
//
// TABLESPACE pg_default;
//
// ALTER TABLE IF EXISTS public.likes
// OWNER to postgres;
