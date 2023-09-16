import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SecurityDevicesEntity {
  @PrimaryGeneratedColumn()
  sessionId: string;

  @Column()
  issued: string;

  @Column({ default: true })
  expiration: string;

  @Column({ default: true })
  userId: number;

  @Column({ default: true })
  deviceId: string;

  @Column({ default: true })
  userAgent: string;

  @Column({ default: true })
  ip: string;
}

// -- Table: public.securityDevices
//
// -- DROP TABLE IF EXISTS public."securityDevices";
//
// CREATE TABLE IF NOT EXISTS public."securityDevices"
// (
//   "sessionId" uuid NOT NULL,
//   issued time with time zone,
//   expiration time with time zone,
//   "userId" integer,
//   "deviceId" uuid,
//   "userAgent" text COLLATE pg_catalog."default",
//   ip text COLLATE pg_catalog."default",
//   CONSTRAINT "securityDevices_pkey" PRIMARY KEY ("sessionId"),
//   CONSTRAINT "securityDevices-user" FOREIGN KEY ("userId")
// REFERENCES public.users (id) MATCH SIMPLE
// ON UPDATE NO ACTION
// ON DELETE NO ACTION
// )
//
// TABLESPACE pg_default;
//
// ALTER TABLE IF EXISTS public."securityDevices"
// OWNER to postgresql;
