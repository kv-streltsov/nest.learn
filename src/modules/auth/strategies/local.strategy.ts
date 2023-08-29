import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ValidateUserUseCase } from '../use-cases/validateUserUseCase';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private validateUserUseCase: ValidateUserUseCase) {
    super({
      usernameField: 'loginOrEmail',
      passReqToCallback: true,
    });
  }

  async validate(
    request: Request,
    loginOrEmail: string,
    password: string,
  ): Promise<any> {
    const foundUser = await this.validateUserUseCase.execute(
      loginOrEmail,
      password,
    );
    if (!foundUser) {
      throw new UnauthorizedException();
    }
    // @ts-ignore
    if (foundUser.banInfo.isBanned == true) {
      throw new UnauthorizedException();
    }

    return {
      login: foundUser.login,
      email: foundUser.email,
      userId: foundUser.id,
      ip: request.ip,
      userAgent: request.headers['user-agent'] || `someDevice`,
    };
  }
}
