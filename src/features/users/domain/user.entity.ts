import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ _id: false })
export class EmailConfirmation {
  @Prop({ type: String, required: false })
  confirmationCode: string | undefined;

  @Prop({ type: String, required: false })
  expirationDate: string | undefined;

  @Prop({ required: true })
  isConfirmed: boolean;
}

@Schema({ _id: false })
export class PasswordRecovery {
  @Prop({ type: String, required: false })
  recoveryCode: string | undefined;

  @Prop({ type: String, required: false })
  expirationDate: string | undefined;
}

@Schema()
export class User {
  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: false })
  passwordRecovery: PasswordRecovery;

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
