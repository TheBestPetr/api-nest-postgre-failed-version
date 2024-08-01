import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { User } from '../../../features/users/domain/user.entity';

@Schema()
export class ReqCount {
  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  URL: string;

  @Prop({ required: true })
  date: Date;
}

export const ReqCountSchema = SchemaFactory.createForClass(ReqCount);
ReqCountSchema.loadClass(User);

export type ReqCountDocument = HydratedDocument<ReqCount>;

export type ReqCountModelType = Model<ReqCountDocument>;
