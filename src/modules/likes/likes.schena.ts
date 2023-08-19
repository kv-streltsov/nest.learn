import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CommentsDocument = HydratedDocument<Likes>;

@Schema()
export class Likes {
  @Prop({ type: String, required: true })
  entityId: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  status: string;

  @Prop({ type: String, required: true })
  addedAt: string;
}

export const LikesSchema = SchemaFactory.createForClass(Likes);
