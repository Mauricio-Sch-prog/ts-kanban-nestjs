import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { createUserMock } from 'src/test/factories/user.factory';
import { TagsController } from 'src/tags/tags.controller';
import { TagsService } from 'src/tags/tags.service';
import { CreateTagDto } from 'src/tags/dto/create-tag.dto';
import { createTagMock } from 'src/test/factories/tag.factory';
import { UpdateTagDto } from 'src/tags/dto/update-tag.dto';

const validId = '550e8400-e29b-41d4-a716-446655440000';

describe('TagsController', () => {
  let controller: TagsController;

  const mockTagsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findTaskTags: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagsController],
      providers: [
        {
          provide: TagsService,
          useValue: mockTagsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<TagsController>(TagsController);
  });

  describe('create', () => {
    const dto: CreateTagDto = {
      name: 'Tags can have any name',
    };
    it('should create a task', async () => {
      const mockTag = createTagMock();
      const mockUser = createUserMock();

      mockTagsService.create.mockResolvedValue(mockTag);

      const result = await controller.create(dto, mockUser);

      expect(mockTagsService.create).toHaveBeenCalledWith(dto, mockUser.id);
      expect(result).toEqual(mockTag);
    });
  });

  describe('findAll', () => {
    it('should return an array of tags', async () => {
      const mockTag = createTagMock();
      mockTagsService.findAll.mockResolvedValue([mockTag]);

      const result = await controller.findAll();

      expect(mockTagsService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockTag]);
    });
  });

  describe('findOne', () => {
    it('should return a single tag', async () => {
      const mockTag = createTagMock();
      mockTagsService.findOne.mockResolvedValue(mockTag);

      const result = await controller.findOne(validId);

      expect(mockTagsService.findOne).toHaveBeenCalledWith(validId);
      expect(result).toEqual(mockTag);
    });
  });

  describe('findBoardLanes', () => {
    it("Should return a task's tags", async () => {
      const mockTag = createTagMock();
      const taksId = 'uuid-taksId';
      mockTagsService.findTaskTags.mockResolvedValue([mockTag]);

      const result = await controller.findTaskTags(taksId);

      expect(mockTagsService.findTaskTags).toHaveBeenCalledWith(taksId);
      expect(result).toEqual([mockTag]);
    });
  });

  describe('update', () => {
    it('should update and return tag', async () => {
      const dto: UpdateTagDto = {
        name: 'namestylistic',
        task: 'another taskId',
      };
      const mockTag = createTagMock();
      const user = createUserMock();

      const updatedTag = { ...mockTag, ...dto };

      mockTagsService.update.mockResolvedValue(updatedTag);

      const result = await controller.update(validId, dto, user);

      expect(mockTagsService.update).toHaveBeenCalledWith(
        validId,
        dto,
        user.id,
      );
      expect(result).toEqual(updatedTag);
    });
  });

  describe('remove', () => {
    it('should remove a tag', async () => {
      mockTagsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(validId);

      expect(mockTagsService.remove).toHaveBeenCalledWith(validId);
      expect(result).toBeUndefined();
    });
  });
});
