import { Response } from 'express';
import { AuthService } from '../../auth.service';
import { CreateDeviceSessionSqlUseCase } from '../../../security-devices/use-cases/postgresql/createDeviceSessionSqlUseCase';
import { CommandHandler } from '@nestjs/cqrs';

export type JwrPairDto = {
  accessToken: string;
  refreshToken: string;
};

export class RefreshTokenSqlUseCaseCommand {
  constructor(public request: any, public response: Response) {}
}

@CommandHandler(RefreshTokenSqlUseCaseCommand)
export class RefreshTokenSqlUseCase {
  constructor(
    private createDeviceSessionUseCase: CreateDeviceSessionSqlUseCase,
    private authService: AuthService,
  ) {}
  async execute(command: RefreshTokenSqlUseCaseCommand) {
    const jwtPair: JwrPairDto = await this.authService.createJwtPair(
      command.request,
      command.response,
    );

    await this.createDeviceSessionUseCase.execute(
      jwtPair,
      command.request.user,
    );

    return {
      accessToken: jwtPair.accessToken,
    };
  }
}
