import { faker } from '@faker-js/faker';
import { createBaseMock } from './base.factory';
import { createUserMock } from './user.factory';
import { Task } from 'src/task/entities/task.entity';
import { createLaneMock } from './lane.factory';

export const createTaskMock = (overrides: Partial<Task> = {}): Task => ({
  ...createBaseMock(),
  title: faker.finance.accountName(),
  description: faker.company.catchPhraseDescriptor(),
  user: overrides.user ?? createUserMock(),
  lane: overrides.lane ?? createLaneMock(),
  ...overrides,
});
