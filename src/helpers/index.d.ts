import { JwtPayloadDto } from '../modules/auth/strategies/refreshToken.strategy';

declare global {
  namespace Express {
    export interface Request {
      user: JwtPayloadDto | null | any;
    }
  }
}
