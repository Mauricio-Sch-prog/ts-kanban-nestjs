import { Injectable, Scope } from '@nestjs/common';
import { Lane } from './entities/lane.entity';
import { BaseScopedRepository } from 'src/common/base.scoped.repository';

@Injectable({ scope: Scope.REQUEST })
export class LaneScopedRepository extends BaseScopedRepository<Lane> {
  protected entity = Lane;
}
