import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthService } from '../auth.service';
import { AuthenticatedRequest } from '../../common/interfaces/authenticatedRequest.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.cookies['access_token'] as string | undefined;

    if (!token) throw new UnauthorizedException('Missing token');

    const user = await this.authService.validateToken(token);

    if (!user) throw new UnauthorizedException('Invalid user id');

    request.user = user;

    return true;
  }
}
