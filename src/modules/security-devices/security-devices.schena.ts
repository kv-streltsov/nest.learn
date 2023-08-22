import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SecurityDevicesDocument = HydratedDocument<SecurityDevices>;
@Schema()
export class SecurityDevices {
  @Prop({ type: String, required: true })
  issued: string;

  @Prop({ type: String, required: true })
  expiration: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  deviceId: string;

  @Prop({ type: String, required: true })
  sessionId: string;

  @Prop({ type: String, required: true })
  userAgent: string;

  @Prop({ type: String, required: true })
  ip: string;
}

export const SecurityDevicesSchema =
  SchemaFactory.createForClass(SecurityDevices);
