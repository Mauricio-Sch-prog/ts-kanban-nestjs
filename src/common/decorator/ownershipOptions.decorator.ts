import { SetMetadata } from '@nestjs/common';
import { FindOptionsWhere } from 'typeorm';

export const OWNERSHIP_KEY = 'ownership';

export interface OwnershipOptions<T> {
  entity: new () => T;
  param?: string;
  where: (userId: string, resourceId: string) => FindOptionsWhere<T>;
}

export const CheckOwnership = <T>(options: OwnershipOptions<T>) =>
  SetMetadata(OWNERSHIP_KEY, options);
