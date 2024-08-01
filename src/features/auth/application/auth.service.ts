import { Injectable } from '@nestjs/common';
import { UserInputDto } from '../../users/api/dto/input/user.input.dto';
import { User } from '../../users/domain/user.entity';
import { add } from 'date-fns';
import { BcryptService } from '../../../infrastructure/utils/services/bcrypt.service';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { NodemailerService } from '../../../infrastructure/utils/services/nodemailer.service';
import { randomUUID } from 'node:crypto';
import { JwtService } from '../../../infrastructure/utils/services/jwt.service';
import { AuthInputLoginDto } from '../api/dto/input/auth.input.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly bcryptService: BcryptService,
    private readonly usersRepository: UsersRepository,
    private readonly nodemailerService: NodemailerService,
    private readonly jwtService: JwtService,
  ) {}
  async checkCredentials(input: AuthInputLoginDto): Promise<string | null> {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      input.loginOrEmail,
    );
    if (user) {
      const isPassCorrect = await this.bcryptService.checkPassword(
        input.password,
        user.passwordHash,
      );
      if (isPassCorrect) {
        return user._id.toString();
      }
    }
    return null;
  }

  async userRegistration(input: UserInputDto): Promise<boolean> {
    const passwordHash = await this.bcryptService.genHash(input.password);
    const expDate = add(new Date(), {
      hours: 1,
      minutes: 2,
    }).toISOString();
    const createdUser = new User();
    createdUser.login = input.login;
    createdUser.passwordHash = passwordHash;
    createdUser.email = input.email;
    createdUser.createdAt = new Date().toISOString();
    createdUser.emailConfirmation = {
      confirmationCode: randomUUID(),
      expirationDate: expDate,
      isConfirmed: false,
    };
    await this.usersRepository.createUser(createdUser);

    this.nodemailerService
      .sendRegistrationEmail(
        createdUser.email,
        'User registration code',
        createdUser.emailConfirmation!.confirmationCode!,
      )
      .catch((error) => {
        console.error('Send email error', error);
      });
    return true;
  }

  async loginUser(userId: string) {
    const accessToken = this.jwtService.createAccessJWTToken(userId);
    return { accessToken: accessToken };
  }

  async confirmUserEmail(confirmationCode: string): Promise<boolean> {
    const user =
      await this.usersRepository.findUserByEmailConfirmationCode(
        confirmationCode,
      );
    if (user) {
      user.emailConfirmation.confirmationCode = undefined;
      user.emailConfirmation.expirationDate = undefined;
      user.emailConfirmation.isConfirmed = true;
      const result = await this.usersRepository.updateUserEmailConfirmation(
        user._id.toString(),
        user,
      );
      return result.matchedCount === 1;
    }
    return false;
  }

  async confirmUserEmailResending(email: string): Promise<boolean> {
    const user = await this.usersRepository.findUserByLoginOrEmail(email);
    if (user) {
      user.emailConfirmation.confirmationCode = randomUUID();
      user.emailConfirmation.expirationDate = add(new Date(), {
        hours: 1,
        minutes: 1,
      }).toISOString();
      const result = await this.usersRepository.updateUserEmailConfirmation(
        user._id.toString(),
        user,
      );
      if (result) {
        this.nodemailerService
          .sendRegistrationEmail(
            user.email,
            'User registration new code',
            user.emailConfirmation!.confirmationCode!,
          )
          .catch((error) => {
            console.error(error);
          });
      }
      return true;
    }
    return false;
  }

  async passwordRecovery(email: string): Promise<boolean> {
    const user = await this.usersRepository.findUserByLoginOrEmail(email);
    if (user) {
      user.passwordRecovery = {
        recoveryCode: randomUUID(),
        expirationDate: add(new Date(), {
          hours: 1,
          minutes: 1,
        }).toISOString(),
      };
      const result = await this.usersRepository.passwordRecoveryConfirmation(
        email,
        user,
      );
      if (result) {
        this.nodemailerService
          .sendPasswordRecoveryEmail(
            email,
            'password recovery code',
            user.passwordRecovery.recoveryCode!,
          )
          .catch((error) => {
            console.error(error);
          });
        return true;
      }
    }
    return false;
  }

  async newPasswordConfirmation(
    password: string,
    recoveryCode: string,
  ): Promise<boolean> {
    const user =
      await this.usersRepository.findUserByPasswordRecoveryCode(recoveryCode);
    if (user) {
      user.passwordRecovery!.recoveryCode = undefined;
      user.passwordRecovery!.expirationDate = undefined;
      const newPasswordHash = await this.bcryptService.genHash(password);
      const result = await this.usersRepository.updatePasswordRecovery(
        user._id.toString(),
        newPasswordHash,
        user,
      );
      return result.matchedCount === 1;
    }
    return false;
  }
}
