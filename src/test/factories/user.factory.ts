import { faker } from '@faker-js/faker';
import { createBaseMock } from './base.factory';
export const createUserMock = (overrides = {}) => ({
  ...createBaseMock(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  name: faker.internet.userName(),
  ...overrides,
});
