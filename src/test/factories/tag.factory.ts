import { faker } from '@faker-js/faker';
import { createBaseMock } from './base.factory';
import { createUserMock } from './user.factory';
import { Tag } from 'src/tags/entities/tag.entity';
import { createTaskMock } from './task.factory';

export const createTagMock = (overrides: Partial<Tag> = {}): Tag => ({
  ...createBaseMock(),
  name: faker.finance.accountName(),
  user: overrides.user ?? createUserMock(),
  task: overrides.task ?? createTaskMock(),
  ...overrides,
});
