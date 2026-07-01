import { Injectable, Scope } from '@nestjs/common';
import { BaseScopedRepository } from 'src/common/base.scoped.repository';
import { Tag } from './entities/tag.entity';

@Injectable({ scope: Scope.REQUEST })
export class TagsScopedRepository extends BaseScopedRepository<Tag> {
  protected entity = Tag;
}
