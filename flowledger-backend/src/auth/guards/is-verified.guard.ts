import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class IsVerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user: User }>();
    const user = request.user;

    if (!user?.isVerified) {
      throw new ForbiddenException(
        'Email not verified. Please verify your email before proceeding.',
      );
    }

    return true;
  }
}
