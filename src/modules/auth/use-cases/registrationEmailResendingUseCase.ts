import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersQueryRepository } from '../../users/users.query.repository';
import { UsersRepository } from '../../users/users.repository';
import { randomUUID } from 'crypto';
import { EmailService } from '../../email/email.service';

@Injectable()
export class RegistrationEmailResendingUseCase {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private usersRepository: UsersRepository,
    private emailService: EmailService,
  ) {}
  async execute(email: string) {
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
}
