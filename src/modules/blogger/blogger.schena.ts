import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BlogsDocument = HydratedDocument<Bloggers>;
@Schema()
export class Bloggers {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true })
  ownerId: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true })
  websiteUrl: string;

  @Prop({ type: String, required: true })
  createdAt: string;

  @Prop({ type: Boolean, required: true })
  isMembership: boolean;
}

export const BloggersSchema = SchemaFactory.createForClass(Bloggers);
