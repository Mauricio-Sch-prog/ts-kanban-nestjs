import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../../../user/user.controller';
import { UserService } from '../../../user/user.service';
import { CreateUserDto } from '../../../user/dto/create-user.dto';
import { UpdateUserDto } from '../../../user/dto/update-user.dto';
import { createUserMock } from 'src/test/factories/user.factory';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto: CreateUserDto = {
        email: 'test@test.com',
        password: '123456',
      };
      const mockUser = createUserMock();

      mockUserService.create.mockResolvedValue(mockUser);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUser = createUserMock();
      mockUserService.findAll.mockResolvedValue([mockUser]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const mockUser = createUserMock();
      mockUserService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('uuid-123');

      expect(service.findOne).toHaveBeenCalledWith('uuid-123');
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update and return user', async () => {
      const dto: UpdateUserDto = {
        email: 'updated@test.com',
      };
      const mockUser = createUserMock();

      const updatedUser = { ...mockUser, ...dto };

      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('uuid-123', dto);

      expect(service.update).toHaveBeenCalledWith('uuid-123', dto);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockUserService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('uuid-123');

      expect(service.remove).toHaveBeenCalledWith('uuid-123');
      expect(result).toBeUndefined();
    });
  });
});