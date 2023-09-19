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
