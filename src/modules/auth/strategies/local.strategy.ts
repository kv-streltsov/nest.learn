import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
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
    const foundUser = await this.authService.validateUser(
      loginOrEmail,
      password,
    );
    if (!foundUser) {
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
