import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema()
export class CommentLikeEntity {
  @Prop({ required: true })
  commentId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ enum: ['None', 'Like', 'Dislike'], required: true })
  status: string;

  @Prop({ required: true })
  createdAt: string;
}

export const CommentLikeSchema =
  SchemaFactory.createForClass(CommentLikeEntity);
CommentLikeSchema.loadClass(CommentLikeEntity);

export type CommentLikeDocument = HydratedDocument<CommentLikeEntity>;

export type CommentLikeInfoModelType = Model<CommentLikeDocument>;
