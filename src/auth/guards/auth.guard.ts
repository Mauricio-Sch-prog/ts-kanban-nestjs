import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('passing the guard');

    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies['access_token'] as string | undefined;

    if (!token) throw new UnauthorizedException('Missing token');

    const user = await this.authService.validateToken(token);

    if (!user) throw new UnauthorizedException('Invalid user id');

    request['user'] = user;

    return true;
  }
}
