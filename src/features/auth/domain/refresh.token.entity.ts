import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema()
export class RefreshTokenEntity {
  @Prop({ required: true })
  token: string;
}

export const RefreshTokenBlacklistSchema =
  SchemaFactory.createForClass(RefreshTokenEntity);
RefreshTokenBlacklistSchema.loadClass(RefreshTokenEntity);

export type RefreshTokenBlacklistDocument =
  HydratedDocument<RefreshTokenEntity>;

export type RefreshTokenBlacklistModelType =
  Model<RefreshTokenBlacklistDocument>;
