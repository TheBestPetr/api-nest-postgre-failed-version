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
import { TokensType } from '../../../base/types/tokens.type';
import { RefreshTokenRepository } from '../infrastructure/refrest.token.repository';
import { DevicesRepository } from '../../securityDevices/infrastructure/devices.repository';
import { DevicesService } from '../../securityDevices/application/devices.service';
import { Device } from '../../securityDevices/domain/device.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly bcryptService: BcryptService,
    private readonly usersRepository: UsersRepository,
    private readonly nodemailerService: NodemailerService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly devicesRepository: DevicesRepository,
    private readonly devicesService: DevicesService,
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

  async loginUser(
    userId: string,
    ip: string,
    deviceName: string,
  ): Promise<TokensType> {
    const newDeviceId = randomUUID().toString();
    const accessToken = this.jwtService.createAccessJWTToken(userId);
    const refreshToken = this.jwtService.createRefreshJWTToken(
      userId,
      newDeviceId,
    );
    const iatNExp = this.jwtService.getTokenIatNExp(refreshToken);
    const newDevice = new Device();
    newDevice.userId = userId;
    newDevice.deviceId = newDeviceId;
    newDevice.iat = new Date(iatNExp!.iat * 1000).toISOString();
    newDevice.deviceName = deviceName;
    newDevice.ip = ip;
    newDevice.exp = new Date(iatNExp!.exp * 1000).toISOString();

    await this.devicesService.createDevice(newDevice);
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async logoutUser(refreshToken: string): Promise<boolean> {
    const userId = this.jwtService.getUserIdByToken(refreshToken);
    const isTokenInBlacklist =
      await this.refreshTokenRepository.isTokenInBlacklist(refreshToken);
    const deviceId = this.jwtService.getDeviceIdByToken(refreshToken);
    const isDeviceExist =
      await this.devicesRepository.findSessionByDeviceId(deviceId);
    if (!userId || isTokenInBlacklist || !isDeviceExist) {
      return false;
    }
    await this.devicesRepository.deleteSessionByDeviceId(deviceId);
    await this.refreshTokenRepository.addTokenInBlacklist(refreshToken);
    return true;
  }

  async createNewTokens(refreshToken: string): Promise<TokensType | null> {
    const isTokenInBlacklist =
      await this.refreshTokenRepository.isTokenInBlacklist(refreshToken);
    const userId = this.jwtService.getUserIdByToken(refreshToken);
    const deviceId = this.jwtService.getDeviceIdByToken(refreshToken);
    const oldIat = this.jwtService.getTokenIatNExp(refreshToken);
    const isDeviceExist =
      this.devicesRepository.findSessionByDeviceId(deviceId);
    if (!userId || isTokenInBlacklist || !isDeviceExist) {
      return null;
    }
    await this.refreshTokenRepository.addTokenInBlacklist(refreshToken);
    const newAccessToken = this.jwtService.createAccessJWTToken(userId);
    const newRefreshToken = this.jwtService.createRefreshJWTToken(
      userId,
      deviceId,
    );
    const iatNExp = this.jwtService.getTokenIatNExp(newRefreshToken);
    await this.devicesService.updateDeviceIatNExp(
      deviceId,
      new Date(oldIat!.iat * 1000).toISOString(),
      new Date(iatNExp!.iat * 1000).toISOString(),
      new Date(iatNExp!.exp * 1000).toISOString(),
    );
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
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
