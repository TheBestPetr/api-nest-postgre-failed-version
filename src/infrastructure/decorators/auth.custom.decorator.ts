import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  //ValidationArguments,
} from 'class-validator';
import { UsersRepository } from '../../features/users/infrastructure/users.repository';

@ValidatorConstraint({ name: 'passwordRecoveryCodeIsExist', async: true })
@Injectable()
export class passwordRecoveryCodeIsExist
  implements ValidatorConstraintInterface
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async validate(recoveryCode: string) {
    const userPasswordRecovery =
      await this.usersRepository.findUserByPasswordRecoveryCode(recoveryCode);
    if (
      !userPasswordRecovery ||
      userPasswordRecovery.expirationDate! < new Date().toISOString()
    ) {
      throw new BadRequestException([
        { message: 'Some Error', field: 'recoveryCode' },
      ]);
    }
    return true;
  }
}

@ValidatorConstraint({ name: 'loginIsExist', async: true })
@Injectable()
export class loginIsExist implements ValidatorConstraintInterface {
  constructor(private readonly usersRepository: UsersRepository) {}

  async validate(login: string) {
    const user = await this.usersRepository.findUserByLoginOrEmail(login);
    if (user) {
      throw new BadRequestException([
        { message: 'Login does not exist', field: 'login' },
      ]);
    }
    return true;
  }
}

@ValidatorConstraint({ name: 'emailIsExist', async: true })
@Injectable()
export class emailIsExist implements ValidatorConstraintInterface {
  constructor(private readonly usersRepository: UsersRepository) {}

  async validate(email: string) {
    const user = await this.usersRepository.findUserByLoginOrEmail(email);
    if (user) {
      throw new BadRequestException([
        { message: 'Email does not exist', field: 'email' },
      ]);
    }
    return true;
  }
}

@ValidatorConstraint({ name: 'emailConfirmationCodeIsExist', async: true })
@Injectable()
export class emailConfirmationCodeIsExist
  implements ValidatorConstraintInterface
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async validate(confirmationCode: string) {
    const userEmailConfirmation =
      await this.usersRepository.findUserByEmailConfirmationCode(
        confirmationCode,
      );
    if (
      !userEmailConfirmation ||
      userEmailConfirmation.expirationDate! < new Date().toISOString() ||
      userEmailConfirmation.isConfirmed
    ) {
      throw new BadRequestException([{ message: 'Some Error', field: 'code' }]);
    }
    return true;
  }
}

@ValidatorConstraint({ name: 'emailResendingIsEmailConfirmed', async: true })
@Injectable()
export class emailResendingIsEmailConfirmed
  implements ValidatorConstraintInterface
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async validate(email: string) {
    const userEmailConfirmationInfo =
      await this.usersRepository.findUserEmailConfirmationInfo(email);
    if (userEmailConfirmationInfo.isConfirmed === true) {
      throw new BadRequestException([
        { message: 'Email is already confirmed', field: 'email' },
      ]);
    }
    return true;
  }
}
