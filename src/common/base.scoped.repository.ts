import { Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import * as typeorm from 'typeorm';
import type { AuthenticatedRequest } from './interfaces/authenticatedRequest.interface';

export abstract class BaseScopedRepository<T extends typeorm.ObjectLiteral> {
  protected abstract entity: typeorm.EntityTarget<T>;

  constructor(
    protected dataSource: typeorm.DataSource,
    @Inject(REQUEST) protected request: AuthenticatedRequest,
  ) {}

  find(options?: typeorm.FindManyOptions<T>) {
    return this.repo.find({
      ...options,
      where: {
        ...(options?.where || {}),
        user: { id: this.userId },
      },
    });
  }

  findOne(options: typeorm.FindOneOptions<T>) {
    return this.repo.findOne({
      ...options,
      where: {
        ...(options.where || {}),
        user: { id: this.userId },
      },
    });
  }

  async save(entity: typeorm.DeepPartial<T>) {
    return this.repo.save({
      ...entity,
      user: { id: this.userId },
    });
  }

  async softRemove(criteria: any) {
    return this.repo.softRemove({
      ...criteria,
      user: { id: this.userId },
    });
  }

  protected get repo(): typeorm.Repository<T> {
    if (!this.entity) {
      throw new Error('Entity not defined in scoped repository');
    }

    return this.dataSource.getRepository(this.entity);
  }

  protected get userId(): string {
    const user = this.request.user;

    if (!user) {
      throw new Error('User not found in request (guard may not have run)');
    }

    return user.id;
  }
}
