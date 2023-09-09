import { Injectable } from '@nestjs/common';
import { UserRegistrationDto } from '../../dto/create-auth.dto';
import { EmailService } from '../../../email/email.service';
import { CreateUserUseCase } from '../../../users/use-cases/mongodb/createUserUseCase';

@Injectable()
export class RegistrationUseCase {
  constructor(
    private emailService: EmailService,
    private createUserUseCase: CreateUserUseCase,
  ) {}
  async execute(userRegistrationDto: UserRegistrationDto) {
    const createdUser = await this.createUserUseCase.execute(
      userRegistrationDto,
    );
    this.emailService.sendMailRegistration(
      userRegistrationDto.email,
      createdUser.uuid,
    );
    return;
  }
}
