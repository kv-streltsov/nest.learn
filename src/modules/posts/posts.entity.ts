import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PostsEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ default: true })
  blogId: string;

  @Column({ default: true })
  blogName: string;

  @Column({ default: true })
  title: string;

  @Column({ default: true })
  shortDescription: string;

  @Column({ default: true })
  content: string;

  @Column({ default: true })
  createdAt: string;
}

// -- Table: public.posts
//
// -- DROP TABLE IF EXISTS public.posts;
//
// CREATE TABLE IF NOT EXISTS public.posts
// (
//   id uuid NOT NULL,
//   "blogId" uuid NOT NULL,
//   title text COLLATE pg_catalog."default" NOT NULL,
//   "blogName" text COLLATE pg_catalog."default" NOT NULL,
//   "shortDescription" text COLLATE pg_catalog."default" NOT NULL,
//   content text COLLATE pg_catalog."default" NOT NULL,
//   "createdAt" timestamp with time zone NOT NULL,
//   CONSTRAINT posts_pkey PRIMARY KEY (id),
//   CONSTRAINT "post-blog-fkey" FOREIGN KEY ("blogId")
// REFERENCES public.blogs (id) MATCH SIMPLE
// ON UPDATE NO ACTION
// ON DELETE NO ACTION
// )
//
// TABLESPACE pg_default;
//
// ALTER TABLE IF EXISTS public.posts
// OWNER to postgres;
