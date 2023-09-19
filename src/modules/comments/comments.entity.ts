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
// -- Table: public.comments
//
// -- DROP TABLE IF EXISTS public.comments;
//
// CREATE TABLE IF NOT EXISTS public.comments
// (
//   id uuid NOT NULL,
//   "entityId" uuid NOT NULL,
//   content text COLLATE pg_catalog."default" NOT NULL,
//   "commentatorInfo" jsonb NOT NULL,
//   "createdAt" timestamp with time zone NOT NULL,
//   CONSTRAINT comments_pkey PRIMARY KEY (id)
// )
//
// TABLESPACE pg_default;
//
// ALTER TABLE IF EXISTS public.comments
// OWNER to postgres;
