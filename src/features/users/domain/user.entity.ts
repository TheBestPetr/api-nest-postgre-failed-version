import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ _id: false })
export class EmailConfirmation {
  @Prop({ type: String, required: false })
  confirmationCode: string | null;

  @Prop({ type: String, required: false })
  expirationDate: string | null;

  @Prop({ required: true })
  isConfirmed: boolean;
}

@Schema()
export class User {
  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  emailConfirmation: EmailConfirmation;

  @Prop({ required: true })
  createdAt: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User);

export type UserDocument = HydratedDocument<User>;

/*type UserModelStaticType = {
  createUser: (name: string, email: string | null) => UserDocument;
};*/

export type UserModelType = Model<UserDocument>; // & UserModelStaticType;
