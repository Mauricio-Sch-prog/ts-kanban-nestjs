import { faker } from '@faker-js/faker';
import { createBaseMock } from './base.factory';
import { createUserMock } from './user.factory';
import { Board } from 'src/board/entities/board.entity';

export const createBoardMock = (overrides: Partial<Board> = {}): Board => ({
  ...createBaseMock(),
  name: faker.word.noun(),
  positionX: 100,
  positionY: 100,
  positionZ: 1,
  height: 400,
  width: 300,
  user: overrides.user ?? createUserMock(),
  lanes: [],
  ...overrides,
});
