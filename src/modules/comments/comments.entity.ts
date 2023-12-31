import {Column, Entity, Generated, PrimaryColumn, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
class Comments {
  @PrimaryColumn({type:"uuid"})
  @Generated("uuid") id: string;

  @Column({ default: true })
  entityId: string;

  @Column({ default: true })
  content: string;

  @Column({
    type: 'jsonb',
  })
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };

  @Column({ default: true })
  createdAt: string;
}
export { Comments as CommentsEntity }
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
