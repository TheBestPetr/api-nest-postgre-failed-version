import { Prop, Schema } from '@nestjs/mongoose';

export type LikeStatus = 'None' | 'Like' | 'Dislike';

@Schema({ _id: false })
export class LikeDetailsType {
  @Prop({ type: String, required: true })
  addedAt: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  login: string;
}

@Schema({ _id: false })
export class ExtendedLikesInfo {
  @Prop({ required: true })
  likesCount: number;

  @Prop({ required: true })
  dislikesCount: number;

  @Prop({ required: true })
  myStatus: LikeStatus;

  @Prop({ type: LikeDetailsType, required: true })
  newestLikes: LikeDetailsType[] | [];
}
