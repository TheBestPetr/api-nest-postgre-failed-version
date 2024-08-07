import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema()
export class PostLikeEntity {
  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userLogin: string;

  @Prop({ enum: ['None', 'Like', 'Dislike'], required: true })
  status: string;

  @Prop({ required: true })
  createdAt: string;
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLikeEntity);
PostLikeSchema.loadClass(PostLikeEntity);

export type PostLikeDocument = HydratedDocument<PostLikeEntity>;

export type PostLikeInfoModelType = Model<PostLikeDocument>;
