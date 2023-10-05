import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {UserEntity} from "../users/user.entity";

@Entity()
class SecurityDevices {
  @PrimaryGeneratedColumn()
  sessionId: string;

  @Column()
  issued: string;

  @Column({ default: true })
  expiration: string;



  @Column({ default: true })
  deviceId: string;

  @Column({ default: true })
  userAgent: string;

  @Column({ default: true })
  ip: string;

  // @Column({ default: true })
  // userId: number;

  @OneToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity
}
export { SecurityDevices as SecurityDevicesEntity }

// -- Table: public.securityDevices
//
// -- DROP TABLE IF EXISTS public."securityDevices";
//
// CREATE TABLE IF NOT EXISTS public."securityDevices"
// (
//   "sessionId" uuid NOT NULL,
//   "deviceId" uuid NOT NULL,
//   "userAgent" text COLLATE pg_catalog."default",
//   ip text COLLATE pg_catalog."default",
//   issued timestamp with time zone NOT NULL,
//   expiration timestamp with time zone NOT NULL,
//   "userId" uuid NOT NULL,
//   CONSTRAINT "securityDevices_pkey" PRIMARY KEY ("sessionId"),
//   CONSTRAINT "user-devices" FOREIGN KEY ("userId")
// REFERENCES public.users (id) MATCH SIMPLE
// ON UPDATE NO ACTION
// ON DELETE NO ACTION
// NOT VALID
// )
//
// TABLESPACE pg_default;
//
// ALTER TABLE IF EXISTS public."securityDevices"
// OWNER to postgres;
