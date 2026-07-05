import { Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import * as typeorm from 'typeorm';
import type { AuthenticatedRequest } from './interface/authenticatedRequest.interface';

type Owned = {
  user: { id: string };
};
export abstract class BaseScopedRepository<T extends Owned> {
  protected abstract entity: typeorm.EntityTarget<T>;

  constructor(
    protected dataSource: typeorm.DataSource,
    @Inject(REQUEST) protected request: AuthenticatedRequest,
  ) {}

  find(options?: typeorm.FindManyOptions<T>) {
    const baseWhere = {
      user: { id: this.userId },
    } as typeorm.FindOptionsWhere<T>;

    let where: typeorm.FindOptionsWhere<T> | typeorm.FindOptionsWhere<T>[] =
      baseWhere;

    if (options?.where) {
      if (Array.isArray(options.where)) {
        where = options.where.map((w) => ({
          ...w,
          user: { id: this.userId },
        }));
      } else {
        where = {
          ...options.where,
          user: { id: this.userId },
        };
      }
    }

    return this.repo.find({
      ...options,
      where,
    });
  }

  findOne(options: typeorm.FindOneOptions<T>) {
    const baseWhere = {
      user: { id: this.userId },
    } as typeorm.FindOptionsWhere<T>;

    const where = options.where
      ? {
          ...options.where,
          user: { id: this.userId },
        }
      : baseWhere;

    return this.repo.findOne({
      ...options,
      where,
    });
  }

  async save(entity: typeorm.DeepPartial<T>) {
    return this.repo.save({
      ...entity,
      user: { id: this.userId },
    });
  }

  async softRemove(criteria: Partial<T>): Promise<boolean> {
    const result = await this.repo.softDelete(this.scopedWhere(criteria));

    return (result.affected ?? 0) > 0;
  }

  private scopedWhere(criteria: Partial<T>): typeorm.FindOptionsWhere<T> {
    return {
      ...(criteria as typeorm.FindOptionsWhere<T>),
      user: { id: this.userId } as unknown as typeorm.FindOptionsWhere<T>,
    };
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
