import { Request } from 'express';
import { AuthenticatedUser } from './authenticatedUser.interface';

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
  params: Record<string, string>;
}
