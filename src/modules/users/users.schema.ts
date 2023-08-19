import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UsersDocument = HydratedDocument<Users>;

@Schema()
export class Users {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true })
  login: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, required: true })
  createdAt: string;

  @Prop({ type: String, required: true })
  salt: string;

  @Prop({ type: Object, required: true })
  confirmation: string;
}

export const UsersSchema = SchemaFactory.createForClass(Users);
