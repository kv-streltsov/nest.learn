import {
  Body,
  Controller,
  Get,
  Res,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Response } from 'express';
import {
  EmailPasswordRecoveryDto,
  NewPasswordRecoveryDto,
  RegistrationConfirmationCodeDto,
  RegistrationEmailResendingDto,
  UserRegistrationDto,
} from './dto/create-auth.dto';

import { AuthGuard } from '@nestjs/passport';
import { AuthService, JwrPairDto } from './auth.service';
import { RefreshTokenGuard } from './strategies/refreshToken.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post(`password-recovery`)
  @HttpCode(HttpStatus.NO_CONTENT)
  passwordRecovery(@Body() emailDto: EmailPasswordRecoveryDto) {
    return emailDto;
  }

  @Post(`new-password`)
  @HttpCode(HttpStatus.NO_CONTENT)
  newPassword(
    @Body()
    newPasswordRecoveryDto: NewPasswordRecoveryDto,
  ) {
    return newPasswordRecoveryDto;
  }

  @Post(`login`)
  @UseGuards(AuthGuard('local'))
  @HttpCode(HttpStatus.OK)
  async login(
    @Headers() headers: any,
    @Ip() ip: string,
    @Res({ passthrough: true }) response: Response,
    @Request() req: any,
  ) {
    const jwtPair: JwrPairDto = await this.authService.login(
      req.user,
      req.headers,
      ip,
    );

    response.cookie(`refreshToken`, jwtPair.refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return {
      accessToken: jwtPair.accessToken,
    };
  }

  @Post(`refresh-token`)
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Headers() headers: any,
    @Ip() ip: string,
    @Request() req: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const jwtPair: JwrPairDto = await this.authService.login(
      req.user,
      headers,
      ip,
    );

    response.cookie(`refreshToken`, jwtPair.refreshToken);
    return {
      accessToken: jwtPair.accessToken,
    };
  }

  @Post(`registration-confirmation`)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(
    @Body()
    registrationConfirmationCodeDto: RegistrationConfirmationCodeDto,
  ) {
    await this.authService.confirmationUser(
      registrationConfirmationCodeDto.code,
    );
    return registrationConfirmationCodeDto;
  }

  @Post(`registration`)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() userRegistrationDto: UserRegistrationDto) {
    return this.authService.registration(userRegistrationDto);
  }

  @Post(`registration-email-resending`)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(
    @Body()
    registrationEmailResendingDto: RegistrationEmailResendingDto,
  ) {
    return await this.authService.registrationEmailResending(
      registrationEmailResendingDto.email,
    );
  }

  @Post(`logout`)
  @HttpCode(HttpStatus.NO_CONTENT)
  logout() {
    return;
  }

  @Get(`me`)
  @HttpCode(HttpStatus.OK)
  me() {
    return `me`;
  }
}
