import { Injectable, Scope } from '@nestjs/common';
import { BaseScopedRepository } from 'src/common/base.scoped.repository';
import { Board } from './entities/board.entity';

@Injectable({ scope: Scope.REQUEST })
export class BoardScopedRepository extends BaseScopedRepository<Board> {
  protected entity = Board;
}
