import { Response } from 'express';
import { AuthService } from '../../auth.service';
import { CreateDeviceSessionSqlUseCase } from '../../../security-devices/use-cases/postgresql/createDeviceSessionSqlUseCase';
import { CommandHandler } from '@nestjs/cqrs';
export type JwrPairDto = {
  accessToken: string;
  refreshToken: string;
};

export class LoginSqlUseCaseCommand {
  constructor(public request: any, public response: Response) {}
}

@CommandHandler(LoginSqlUseCaseCommand)
export class LoginSqlUseCase {
  constructor(
    private createDeviceSessionUseCase: CreateDeviceSessionSqlUseCase,
    private authService: AuthService,
  ) {}
  async execute(command: LoginSqlUseCaseCommand): Promise<JwrPairDto> {
    const jwtPair = await this.authService.createJwtPair(
      command.request,
      command.response,
    );
    await this.createDeviceSessionUseCase.execute(
      jwtPair,
      command.request.user,
    );
    return jwtPair;
  }
}
