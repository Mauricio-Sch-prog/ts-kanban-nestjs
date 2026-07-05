import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../../user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../user/entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createUserMock } from '../../factories/user.factory';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<Repository<User>>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    preload: jest.fn(),
    softRemove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should hash password and save user', async () => {
      const dto = {
        email: 'test@test.com',
        password: '123456',
      };

      const hashedPassword = 'hashed-password';
      const createdUser = createUserMock({ ...dto, password: hashedPassword });

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      repository.create.mockReturnValue(createdUser);
      repository.save.mockResolvedValue(createdUser);

      const result = await service.create(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 12);
      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        password: hashedPassword,
      });
      expect(repository.save).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(createdUser);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [createUserMock()];

      repository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const user = createUserMock();

      repository.findOneBy.mockResolvedValue(user);

      const result = await service.findOne(user.id);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: user.id });
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('should update and return user', async () => {
      const user = createUserMock();
      const dto = { email: 'updated@test.com' };
      const updatedUser = { ...user, ...dto };

      repository.preload.mockResolvedValue(updatedUser as User);
      repository.save.mockResolvedValue(updatedUser);

      const result = await service.update(user.id, dto);

      expect(repository.preload).toHaveBeenCalledWith({
        id: user.id,
        ...dto,
      });
      expect(repository.save).toHaveBeenCalledWith(updatedUser);
      expect(result).toEqual(updatedUser);
    });

    it('should throw if user not found', async () => {
      repository.preload.mockResolvedValue(undefined);

      await expect(service.update('non-existent-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete user', async () => {
      const user = createUserMock();

      repository.findOneBy.mockResolvedValue(user);
      repository.softRemove.mockResolvedValue(user);

      await service.remove(user.id);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: user.id });
      expect(repository.softRemove).toHaveBeenCalledWith(user);
    });

    it('should throw if user not found', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
