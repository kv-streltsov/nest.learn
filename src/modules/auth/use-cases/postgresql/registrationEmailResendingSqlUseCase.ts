import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EmailService } from '../../../email/email.service';
import { UsersSqlRepository } from '../../../users/repositories/postgresql/users.sql.repository';
import { UsersSqlQueryRepository } from '../../../users/repositories/postgresql/users.sql.query.repository';
@Injectable()
export class RegistrationEmailResendingSqlUseCase {
  constructor(
    private usersQueryRepository: UsersSqlQueryRepository,
    private usersRepository: UsersSqlRepository,
    private emailService: EmailService,
  ) {}
  async execute(email: string) {
    const foundUser: any =
      await this.usersQueryRepository.getUserByLoginOrEmail(email);

    if (foundUser === null || foundUser.confirmation.isConfirm === `true`) {
      throw new BadRequestException(`wrong email confirm`);
    }
    const uuid = randomUUID();
    await this.usersRepository.updateConfirmationCodeByEmail(email, uuid);

    this.emailService.sendMailRegistration(foundUser.email, uuid);
    return;
  }
}
