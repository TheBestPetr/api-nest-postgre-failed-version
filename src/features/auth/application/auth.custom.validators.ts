import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  //ValidationArguments,
} from 'class-validator';
import { UsersRepository } from '../../users/infrastructure/users.repository';

@ValidatorConstraint({ name: 'passwordRecoveryCodeIsExist', async: true })
@Injectable()
export class passwordRecoveryCodeIsExist
  implements ValidatorConstraintInterface
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async validate(recoveryCode: string) {
    const user =
      await this.usersRepository.findUserByPasswordRecoveryCode(recoveryCode);
    if (
      !user ||
      user!.passwordRecovery!.expirationDate! < new Date().toISOString()
    ) {
      throw new BadRequestException();
    }
    return true;
  }

  defaultMessage() {
    return 'Recovery code does not exist';
  }
}

@ValidatorConstraint({ name: 'loginIsExist', async: true })
@Injectable()
export class loginIsExist implements ValidatorConstraintInterface {
  constructor(private readonly usersRepository: UsersRepository) {}

  async validate(login: string) {
    const user = await this.usersRepository.findUserByLoginOrEmail(login);
    if (user) {
      throw new BadRequestException();
    }
    return true;
  }

  defaultMessage() {
    return 'User is already exist';
  }
}

@ValidatorConstraint({ name: 'emailIsExist', async: true })
@Injectable()
export class emailIsExist implements ValidatorConstraintInterface {
  constructor(private readonly usersRepository: UsersRepository) {}

  async validate(email: string) {
    const user = await this.usersRepository.findUserByLoginOrEmail(email);
    if (user) {
      throw new BadRequestException();
    }
    return true;
  }

  defaultMessage() {
    return 'User is already exist';
  }
}

@ValidatorConstraint({ name: 'emailConfirmationCodeIsExist', async: true })
@Injectable()
export class emailConfirmationCodeIsExist
  implements ValidatorConstraintInterface
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async validate(confirmationCode: string) {
    const user =
      await this.usersRepository.findUserByEmailConfirmationCode(
        confirmationCode,
      );
    if (
      !user ||
      user!.emailConfirmation.expirationDate! < new Date().toISOString() ||
      user!.emailConfirmation.isConfirmed
    ) {
      throw new BadRequestException();
    }
    return true;
  }
}
