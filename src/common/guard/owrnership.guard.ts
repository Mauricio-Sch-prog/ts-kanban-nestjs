import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import {
  OWNERSHIP_KEY,
  OwnershipOptions,
} from '../decorator/ownershipOptions.decorator';
import { AuthenticatedRequest } from '../interface/authenticatedRequest.interface';
import { validate as isUUID } from 'uuid';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.get<OwnershipOptions<unknown>>(
      OWNERSHIP_KEY,
      context.getHandler(),
    );

    if (!options) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user) {
      throw new ForbiddenException('User not authenticated');
    }
    const user = request.user;

    const paramKey = options.param || 'id';
    const resourceId = request.params[paramKey];
    if (!resourceId) {
      throw new ForbiddenException('Missing resource identifier');
    }

    if (!(isUUID as (v: string) => boolean)(resourceId)) {
      throw new BadRequestException('Invalid UUID');
    }
    const repo = this.dataSource.getRepository(options.entity);
    const where = options.where(user.id, resourceId);

    const entity = await repo.findOne({ where });

    if (!entity) {
      throw new ForbiddenException('You do not own this resource');
    }

    return true;
  }
}
