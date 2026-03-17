import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Always return true to allow the request
    return true;
  }

  handleRequest(err, user, info, context) {
    // If there's a user, attach it to the request
    // If not, just continue without a user (no error thrown)
    return user;
  }
}
