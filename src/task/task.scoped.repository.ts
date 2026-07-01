import { Injectable, Scope } from '@nestjs/common';
import { BaseScopedRepository } from 'src/common/base.scoped.repository';
import { Task } from './entities/task.entity';

@Injectable({ scope: Scope.REQUEST })
export class TaskScopedRepository extends BaseScopedRepository<Task> {
  protected entity = Task;
}
