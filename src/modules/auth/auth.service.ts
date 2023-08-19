import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersQueryRepository } from '../users/users.query.repository';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { UserRegistrationDto } from './dto/create-auth.dto';
import { UsersService } from '../users/users.service';
import { SecurityDevicesService } from '../security-devices/security-devices.service';
import { EmailService } from '../email/email.service';
import { UsersRepository } from '../users/users.repository';

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

  async validateUser(loginOrEmail: string, password: string) {
    const foundUser = await this.usersQueryRepository.getUserByLoginOrEmail(
      loginOrEmail,
    );
    if (foundUser === null) {
      return null;
    }

    const passwordHash: string = await this._generateHash(
      password,
      foundUser.salt,
    );

    if (passwordHash !== foundUser.password) {
      return false;
    }
    return foundUser;
  }
  async _generateHash(password: string, salt: string) {
    return await bcrypt.hash(password, salt);
  }
  async login(user: any, headers: any, ip: string): Promise<JwrPairDto> {
    const jwtPair = {
      refreshToken: await this.jwtService.signAsync(
        {
          userId: user.id,
          login: user.login,
          deviceId: randomUUID(),
        },
        {
          expiresIn: '2000s',
        },
      ),
      accessToken: await this.jwtService.signAsync(
        {
          userId: user.id,
          login: user.login,
        },
        {
          expiresIn: '1000s',
        },
      ),
    };
    await this.securityDevicesService.createDeviceSession(jwtPair, headers, ip);
    return jwtPair;
  }
  async registration(userRegistrationDto: UserRegistrationDto) {
    const createdUser = await this.usersService.createUser(userRegistrationDto);
    return await this.emailService.sendMailRegistration(
      userRegistrationDto.email,
      createdUser.uuid,
    );
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

    return await this.emailService.sendMailRegistration(foundUser.email, uuid);
  }
}
