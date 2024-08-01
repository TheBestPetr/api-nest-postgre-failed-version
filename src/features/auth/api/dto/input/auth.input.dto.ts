import {
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  Validate,
} from 'class-validator';
import {
  emailConfirmationCodeIsExist,
  emailIsExist,
  loginIsExist,
  passwordRecoveryCodeIsExist,
} from '../../../application/auth.custom.validators';

export class AuthInputLoginDto {
  @IsString()
  @IsNotEmpty()
  loginOrEmail: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 20)
  password: string;
}

export class AuthInputRegistrationDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 10)
  @Validate(loginIsExist)
  login: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 20)
  password: string;

  @IsString()
  @IsNotEmpty()
  @Validate(emailIsExist)
  email: string;
}

export class AuthInputEmailConfirmationDto {
  @IsString()
  @IsNotEmpty()
  @Validate(emailConfirmationCodeIsExist)
  code: string;
}

export class AuthInputEmailResendingDto {
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class AuthInputEmailPasswordRecoveryDto {
  @IsString()
  @IsNotEmpty()
  @Matches('[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  email: string;
}

export class AuthInputNewPasswordDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 20)
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @Validate(passwordRecoveryCodeIsExist)
  recoveryCode: string;
}
