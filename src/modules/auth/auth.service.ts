import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersQueryRepository } from '../users/users.query.repository';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { UserRegistrationDto } from './dto/create-auth.dto';
import { UsersService } from '../users/users.service';
import { SecurityDevicesService } from '../security-devices/security-devices.service';
import { EmailService } from '../email/email.service';
import { UsersRepository } from '../users/users.repository';
import { Response } from 'express';

export type JwrPairDto = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersQueryRepository: UsersQueryRepository,
    private usersService: UsersService,
    private securityDevicesService: SecurityDevicesService,
    private emailService: EmailService,
    private usersRepository: UsersRepository,
  ) {}
  async getMeInfo(userId: string) {
    const foundUser = await this.usersQueryRepository.getUserById(userId);
    if (!foundUser) {
      throw new UnauthorizedException();
    }
    return {
      email: foundUser.email,
      login: foundUser.login,
      userId,
    };
  }
  async refreshToken(request: any, response: Response) {
    const jwtPair: JwrPairDto = await this.createJwtPair(request, response);

    await this.securityDevicesService.createDeviceSession(
      jwtPair,
      request.user,
    );

    return {
      accessToken: jwtPair.accessToken,
    };
  }
  async logout(user: any) {
    return this.securityDevicesService.logoutDeviceSession(user);
  }
  async registration(userRegistrationDto: UserRegistrationDto) {
    const createdUser = await this.usersService.createUser(userRegistrationDto);
    this.emailService.sendMailRegistration(
      userRegistrationDto.email,
      createdUser.uuid,
    );
    return;
  }
  async confirmationUser(code: string) {
    const foundUser: any =
      await this.usersQueryRepository.getUserByConfirmationCode(code);

    if (foundUser === null || foundUser.confirmation.isConfirm === true) {
      throw new BadRequestException(`wrong code confirm`);
    }

    await this.usersRepository.updateConfirmationCode(code, {
      'confirmation.isConfirm': true,
      'confirmation.code': null,
    });
    return true;
  }
  async registrationEmailResending(email: string) {
    const foundUser: any =
      await this.usersQueryRepository.getUserByLoginOrEmail(email);

    if (foundUser === null || foundUser.confirmation.isConfirm === true) {
      throw new BadRequestException(`wrong email confirm`);
    }
    const uuid = randomUUID();
    await this.usersRepository.updateConfirmationCodeByEmail(email, uuid);

    this.emailService.sendMailRegistration(foundUser.email, uuid);
    return;
  }
  async validateUser(loginOrEmail: string, password: string) {
    const foundUser = await this.usersQueryRepository.getUserByLoginOrEmail(
      loginOrEmail,
    );
    if (foundUser === null) {
      return null;
    }

    const passwordHash: string = await this.generateHash(
      password,
      foundUser.salt,
    );

    if (passwordHash !== foundUser.password) {
      return false;
    }
    return foundUser;
  }
  private async generateHash(password: string, salt: string) {
    return await bcrypt.hash(password, salt);
  }
  private async createJwtPair(request: any, response: Response) {
    const jwtPair = {
      refreshToken: await this.jwtService.signAsync(
        {
          userId: request.user.userId,
          login: request.user.login,
          sessionId: randomUUID(),
          deviceId: request.user.deviceId || randomUUID(),
        },
        {
          expiresIn: '20s',
        },
      ),
      accessToken: await this.jwtService.signAsync(
        {
          userId: request.user.userId,
          login: request.user.login,
        },
        {
          expiresIn: '10s',
        },
      ),
    };

    response.cookie(`refreshToken`, jwtPair.refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return jwtPair;
  }
}
