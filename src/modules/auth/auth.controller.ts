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
import { JwrPairDto } from './auth.service';
import { RefreshTokenGuard } from './strategies/refreshToken.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RefreshTokenUseCase } from './use-cases/mongodb/refreshTokenUseCase';
import { GetMeInfoUseCase } from './use-cases/mongodb/getMeInfoUseCase';
import { ConfirmationUserUseCase } from './use-cases/mongodb/confirmationUseCase';
import { RegistrationSqlUseCase } from './use-cases/postgresql/registrationSqlUseCase';
import { LoginSqlUseCaseCommand } from './use-cases/postgresql/loginSqlUseCase';
import { LogoutSqlUseCaseCommand } from './use-cases/postgresql/logoutSqlUseCase';
import { RegistrationEmailResendingSqlUseCase } from './use-cases/postgresql/registrationEmailResendingSqlUseCase';
import { CommandBus } from '@nestjs/cqrs';
@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private refreshTokenUseCase: RefreshTokenUseCase,
    private registrationUseCase: RegistrationSqlUseCase,
    private getMeInfoUseCase: GetMeInfoUseCase,
    private confirmationUserUseCase: ConfirmationUserUseCase,
    private registrationEmailResendingUseCase: RegistrationEmailResendingSqlUseCase,
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
    const jwtPair: JwrPairDto = await this.commandBus.execute(
      new LoginSqlUseCaseCommand(request, response),
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
    return this.refreshTokenUseCase.execute(request, response);
  }

  @Post(`registration-confirmation`)
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(
    @Body()
    registrationConfirmationCodeDto: RegistrationConfirmationCodeDto,
  ) {
    await this.confirmationUserUseCase.execute(
      registrationConfirmationCodeDto.code,
    );
    return registrationConfirmationCodeDto;
  }

  @Post(`registration`)
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() userRegistrationDto: UserRegistrationDto) {
    return this.registrationUseCase.execute(userRegistrationDto);
  }

  @Post(`registration-email-resending`)
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(
    @Body()
    registrationEmailResendingDto: RegistrationEmailResendingDto,
  ) {
    return await this.registrationEmailResendingUseCase.execute(
      registrationEmailResendingDto.email,
    );
  }

  @Post(`logout`)
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Request() request: any) {
    return this.commandBus.execute(new LogoutSqlUseCaseCommand(request.user));
  }

  @Get(`me`)
  @UseGuards(AuthGuard(`jwt`))
  @HttpCode(HttpStatus.OK)
  async me(@Request() request: any) {
    return await this.getMeInfoUseCase.execute(request.user.userId);
  }
}
