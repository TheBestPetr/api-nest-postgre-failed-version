import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema()
export class Device {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  iat: string;

  @Prop({ required: true })
  deviceName: string;

  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  exp: string;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
DeviceSchema.loadClass(Device);

export type DeviceDocument = HydratedDocument<Device>;

export type DeviceModelType = Model<DeviceDocument>;
