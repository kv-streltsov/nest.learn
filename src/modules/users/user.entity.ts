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
// CREATE TABLE SCRIPT
// -- Table: public.users
//
// -- DROP TABLE IF EXISTS public.users;
//
// CREATE TABLE IF NOT EXISTS public.users
// (
//   id uuid NOT NULL DEFAULT gen_random_uuid(),
//   login text COLLATE pg_catalog."default" NOT NULL,
//   email text COLLATE pg_catalog."default" NOT NULL,
//   password text COLLATE pg_catalog."default" NOT NULL,
//   "createdAt" timestamp without time zone NOT NULL,
//   confirmation jsonb NOT NULL,
//   salt text COLLATE pg_catalog."default" NOT NULL,
//   CONSTRAINT users_pkey PRIMARY KEY (id)
// )
//
// TABLESPACE pg_default;
//
// ALTER TABLE IF EXISTS public.users
// OWNER to postgresql;
