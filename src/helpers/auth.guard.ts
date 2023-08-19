import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import * as process from 'process';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (
      request.headers?.authorization === undefined ||
      request.headers?.authorization.split(' ')[1] !==
        process.env.TOKEN_ADMIN ||
      request.headers?.authorization.split(' ')[0] !== `Basic`
    ) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
