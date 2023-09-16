import { UserRegistrationDto } from '../../dto/create-auth.dto';
import { EmailService } from '../../../email/email.service';
import { CreateUserSqlUseCase } from '../../../users/use-cases/postgresql/createUserSqlUseCase';
import { CommandHandler } from '@nestjs/cqrs';

export class RegistrationSqlUseCaseCommand {
  constructor(public userRegistrationDto: UserRegistrationDto) {}
}
@CommandHandler(RegistrationSqlUseCaseCommand)
export class RegistrationSqlUseCase {
  constructor(
    private emailService: EmailService,
    private createUserSqlUseCase: CreateUserSqlUseCase,
  ) {}
  async execute(command: RegistrationSqlUseCaseCommand) {
    const createdUser = await this.createUserSqlUseCase.execute(
      command.userRegistrationDto,
    );
    this.emailService.sendMailRegistration(
      command.userRegistrationDto.email,
      createdUser.uuid,
    );
    return;
  }
}
