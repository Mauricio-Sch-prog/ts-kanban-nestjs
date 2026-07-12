import { faker } from '@faker-js/faker';
import { createBaseMock } from './base.factory';
import { createUserMock } from './user.factory';
import { Lane } from 'src/lane/entities/lane.entity';
import { createBoardMock } from './board.factory';

export const createLaneMock = (overrides: Partial<Lane> = {}): Lane => ({
  ...createBaseMock(),
  name: faker.finance.accountName(),
  user: overrides.user ?? createUserMock(),
  board: overrides.board ?? createBoardMock(),
  ...overrides,
});
