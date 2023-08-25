import { Injectable } from '@nestjs/common';
import { UserRegistrationDto } from '../dto/create-auth.dto';
import { UsersService } from '../../users/users.service';
import { EmailService } from '../../email/email.service';

@Injectable()
export class RegistrationUseCase {
  constructor(
    private usersService: UsersService,
    private emailService: EmailService,
  ) {}
  async execute(userRegistrationDto: UserRegistrationDto) {
    const createdUser = await this.usersService.createUser(userRegistrationDto);
    this.emailService.sendMailRegistration(
      userRegistrationDto.email,
      createdUser.uuid,
    );
    return;
  }
}
