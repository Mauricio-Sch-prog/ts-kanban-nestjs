import { ObjectLiteral, Repository } from 'typeorm';

export const createMockRepo = <T extends ObjectLiteral>() =>
  ({
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    softRemove: jest.fn(),
  }) as Partial<jest.Mocked<Repository<T>>>;
