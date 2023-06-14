import {
  UnauthorizedException,
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { BasicMessageDto } from 'src/common/dto';
import IUserRequest from '../interfaces/user-request';
import {
  getDidStrFromDidSession,
  verifyDidSession,
} from 'src/utils/user/user-util';

@Injectable()
export class UserAuthMiddleware implements NestMiddleware {
  async use(req: IUserRequest, res: Response, next: NextFunction) {
    const didSession = req.headers['did-session'];
    if (!didSession)
      throw new UnauthorizedException(
        new BasicMessageDto('Unauthorized.', 1, 'did-session not found.'),
      );
    if (didSession) {
      if (!(await verifyDidSession(didSession)))
        throw new BadRequestException(
          `Did session verify error. didSession: ${didSession}`,
        );
    }

    req.did = await getDidStrFromDidSession(didSession);
    next();
  }
}
