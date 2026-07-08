import { faker } from '@faker-js/faker';
import { createBaseMock } from './base.factory';

export const createBoardMock = (overrides = {}) => ({
  ...createBaseMock(),
  name: faker.word.noun(),
  ...overrides,
});
