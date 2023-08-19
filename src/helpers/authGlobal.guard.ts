import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGlobalGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request.headers.authorization === undefined) {
      return true;
    }
    if (request.headers.authorization.split(` `)[0] !== `Bearer`) {
      return true;
    }
    try {
      const jwtDecode: any = this.jwtService.decode(
        request.headers.authorization.split(` `)[1],
      );
      request.headers.authGlobal = {
        userId: jwtDecode.userId,
      };
      return true;
    } catch (err) {
      return true;
    }
    return true;
  }
}
