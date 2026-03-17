import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override canActivate to try authentication but always allow access
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // Try to authenticate, but don't throw if it fails
      await super.canActivate(context);
    } catch (err) {
      // Authentication failed, but we still allow the request
    }
    return true;
  }

  handleRequest(err, user) {
    // Return the user if authenticated, undefined if not
    // Don't throw errors for missing/invalid tokens
    return user;
  }
}
