import { Injectable } from '@nestjs/common';
import { UserRegistrationDto } from '../../dto/create-auth.dto';
import { EmailService } from '../../../email/email.service';
import { CreateUserSqlUseCase } from '../../../users/use-cases/postgresql/createUserSqlUseCase';

@Injectable()
export class RegistrationSqlUseCase {
  constructor(
    private emailService: EmailService,
    private createUserSqlUseCase: CreateUserSqlUseCase,
  ) {}
  async execute(userRegistrationDto: UserRegistrationDto) {
    const createdUser = await this.createUserSqlUseCase.execute(
      userRegistrationDto,
    );
    this.emailService.sendMailRegistration(
      userRegistrationDto.email,
      createdUser.uuid,
    );
    return;
  }
}
