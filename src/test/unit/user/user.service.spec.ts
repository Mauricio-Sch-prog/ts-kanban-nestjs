import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../../user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../user/entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createUserMock } from '../../factories/user.factory';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const mockRepository: Partial<jest.Mocked<Repository<User>>> = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      preload: jest.fn(),
      softRemove: jest.fn(),
    };
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

    it('should throw NotFoundException if user not found', async () => {
      const invalidId = 'non-existent-id';
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(invalidId)).rejects.toThrow(
        NotFoundException,
      );

      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: invalidId,
      });
    });
  });

  describe('findByEmail', () => {
    it('find user by email and return user', async () => {
      const email = 'faker@gmail.com';
      const user = createUserMock({ email: email });
      const selectedUser = {
        id: user.id,
        email: user.email,
        password: user.password,
        name: user.name,
      };

      repository.findOne.mockResolvedValue(selectedUser as User);

      const result = await service.findByEmail(email);

      expect(repository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { email } }),
      );
      expect(result).toEqual(selectedUser);
    });
    it('Should return null if user not found', async () => {
      const invalidEmail = 'notagood@gmail.com';
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail(invalidEmail);

      expect(repository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { email: invalidEmail } }),
      );
      expect(result).toEqual(null);
    });
  });

  describe('update', () => {
    it('should update and return user', async () => {
      const dto: UpdateUserDto = { name: 'BornAnew' };
      const existingUser = createUserMock({ name: 'not really a name' });
      const updatedUser = { ...existingUser, ...dto };

      repository.findOneBy.mockResolvedValue(existingUser);
      repository.save.mockResolvedValue(updatedUser);

      const result = await service.update(existingUser.id, dto);

      expect(repository.save).toHaveBeenCalledWith(updatedUser);
      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: existingUser.id,
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      const invalidId = 'non-existent-id';
      repository.findOneBy.mockResolvedValue(null);

      await expect(
        service.update(invalidId, { name: 'wrong' }),
      ).rejects.toThrow(NotFoundException);

      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: invalidId,
      });
      expect(repository.save).not.toHaveBeenCalled();
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

    it('should throw NotFoundException if user not found', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.softRemove).not.toHaveBeenCalled();
    });
  });
});
