import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CommentsDocument = HydratedDocument<Comments>;
@Schema()
export class Comments {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true })
  entityId: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: {}, required: true })
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };

  @Prop({ type: String, required: true })
  createdAt: string;
}

export const CommentsSchema = SchemaFactory.createForClass(Comments);
