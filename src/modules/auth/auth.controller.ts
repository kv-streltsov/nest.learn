import {
  Body,
  Controller,
  Get,
  Res,
  HttpCode,
  HttpStatus,
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
import { ThrottlerGuard } from '@nestjs/throttler';
import { LoginUseCase } from './use-cases/loginUseCase';
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private loginUseCase: LoginUseCase,
  ) {}

  @Post(`password-recovery`)
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  passwordRecovery(@Body() emailDto: EmailPasswordRecoveryDto) {
    return emailDto;
  }

  @Post(`new-password`)
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  newPassword(
    @Body()
    newPasswordRecoveryDto: NewPasswordRecoveryDto,
  ) {
    return newPasswordRecoveryDto;
  }

  @Post(`login`)
  @UseGuards(ThrottlerGuard, AuthGuard('local'))
  @HttpCode(HttpStatus.OK)
  async login(
    @Res({ passthrough: true }) response: Response,
    @Request() request: any,
  ) {
    const jwtPair: JwrPairDto = await this.loginUseCase.excecute(
      request,
      response,
    );

    return {
      accessToken: jwtPair.accessToken,
    };
  }

  @Post(`refresh-token`)
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Request() request: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.refreshToken(request, response);
  }

  @Post(`registration-confirmation`)
  @UseGuards(ThrottlerGuard)
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
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() userRegistrationDto: UserRegistrationDto) {
    return this.authService.registration(userRegistrationDto);
  }

  @Post(`registration-email-resending`)
  @UseGuards(ThrottlerGuard)
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
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Request() request: any) {
    return this.authService.logout(request.user);
  }

  @Get(`me`)
  @UseGuards(AuthGuard(`jwt`))
  @HttpCode(HttpStatus.OK)
  async me(@Request() request: any) {
    return await this.authService.getMeInfo(request.user.userId);
  }
}
