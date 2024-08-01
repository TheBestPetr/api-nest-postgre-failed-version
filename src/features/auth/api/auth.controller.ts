import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UnauthorizedException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';
import { BearerAuthGuard } from '../../../infrastructure/guards/bearer.auth.guard';
import {
  AuthInputEmailConfirmationDto,
  AuthInputEmailPasswordRecoveryDto,
  AuthInputEmailResendingDto,
  AuthInputLoginDto,
  AuthInputNewPasswordDto,
  AuthInputRegistrationDto,
} from './dto/input/auth.input.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}
  //@UseGuards(ReqIpCounterMiddleware)
  @Post('registration')
  @HttpCode(204)
  async userRegistration(@Body() userInputDto: AuthInputRegistrationDto) {
    const newUser = this.authService.userRegistration(userInputDto);
    if (!newUser) {
      throw new BadRequestException();
    }
  }

  @Post('login')
  @HttpCode(200)
  async loginUser(@Body() userInputLoginDto: AuthInputLoginDto) {
    const userId = await this.authService.checkCredentials(userInputLoginDto);
    if (userId) {
      const accessToken = await this.authService.loginUser(userId);
      return accessToken;
    }
    throw new UnauthorizedException();
  }

  //@UseGuards(ReqIpCounterMiddleware)
  @Post('registration-confirmation')
  @HttpCode(204)
  async userRegistrationConfirmation(
    @Body() input: AuthInputEmailConfirmationDto,
  ) {
    debugger;
    const isUserVerified = await this.authService.confirmUserEmail(input.code);
    if (!isUserVerified) {
      throw new BadRequestException();
    }
  }

  //@UseGuards(ReqIpCounterMiddleware)
  @Post('/registration-email-resending')
  @HttpCode(204)
  async userRegistrationEmailResending(
    @Body() input: AuthInputEmailResendingDto,
  ) {
    const isUserVerified = await this.authService.confirmUserEmailResending(
      input.email,
    );
    if (!isUserVerified) {
      throw new BadRequestException();
    }
  }

  //@UseGuards(ReqIpCounterMiddleware)
  @Post('/password-recovery')
  @HttpCode(204)
  async passwordRecovery(@Body() input: AuthInputEmailPasswordRecoveryDto) {
    const isEmailSend = await this.authService.passwordRecovery(input.email);
    if (!isEmailSend) {
      console.log('Email not be sand');
    }
  }

  //@UseGuards(ReqIpCounterMiddleware)
  @Post('/new-password')
  @HttpCode(204)
  async newPasswordConfirmation(
    @Body()
    input: AuthInputNewPasswordDto,
  ) {
    const isNewPasswordConfirm = await this.authService.newPasswordConfirmation(
      input.newPassword,
      input.recoveryCode,
    );
    if (!isNewPasswordConfirm) {
      throw new BadRequestException();
    }
  }

  @UseGuards(BearerAuthGuard)
  @Get('/me')
  @HttpCode(200)
  async getUserInfo(@Request() req) {
    const userId = req.userId;
    if (userId) {
      const user = await this.usersQueryRepository.findUserById(userId);
      return user;
    }

    throw new UnauthorizedException();
  }
}
