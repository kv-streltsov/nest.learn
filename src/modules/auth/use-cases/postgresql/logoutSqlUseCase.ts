import { SecurityDevicesSqlRepository } from '../../../security-devices/repositories/postgresql/security-devices.sql.repository';
import { CommandHandler } from '@nestjs/cqrs';

export class LogoutSqlUseCaseCommand {
  constructor(public user: any) {}
}
@CommandHandler(LogoutSqlUseCaseCommand)
export class LogoutSqlUseCase {
  constructor(
    private logoutDeviceSessionUseCase: SecurityDevicesSqlRepository,
  ) {}
  async execute(command: LogoutSqlUseCaseCommand) {
    return this.logoutDeviceSessionUseCase.deleteDeviceSession(command.user);
  }
}
