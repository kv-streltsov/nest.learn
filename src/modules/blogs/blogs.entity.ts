import {
  Column,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn
} from 'typeorm';
import {UserEntity} from "../users/user.entity";

@Entity()
class Blogs {
  @PrimaryColumn({type:"uuid"})
  @Generated("uuid") id: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  owner: UserEntity

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
export { Blogs as BlogsEntity }

// -- Table: public.blogs
//
// -- DROP TABLE IF EXISTS public.blogs;
//
// CREATE TABLE IF NOT EXISTS public.blogs
// (
//   id uuid NOT NULL DEFAULT gen_random_uuid(),
//   "ownerId" uuid,
//   name text COLLATE pg_catalog."default" NOT NULL,
//   description text COLLATE pg_catalog."default" NOT NULL,
//   "websiteUrl" text COLLATE pg_catalog."default" NOT NULL,
//   "isMembership" boolean NOT NULL,
//   "createdAt" timestamp with time zone NOT NULL,
//   CONSTRAINT blogs_pkey PRIMARY KEY (id),
//   CONSTRAINT "blog-user-forget" FOREIGN KEY ("ownerId")
// REFERENCES public.users (id) MATCH SIMPLE
// ON UPDATE NO ACTION
// ON DELETE NO ACTION
// )
//
// TABLESPACE pg_default;
//
// ALTER TABLE IF EXISTS public.blogs
// OWNER to postgres;
