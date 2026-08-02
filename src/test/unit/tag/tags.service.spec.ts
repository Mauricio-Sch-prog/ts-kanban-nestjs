import { Test, TestingModule } from '@nestjs/testing';
import { createMockRepo } from 'src/test/base.repo.mock';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from 'src/task/entities/task.entity';
import { TagsService } from 'src/tags/tags.service';
import { TagsScopedRepository } from 'src/tags/tags.scoped.repository';
import { Tag } from 'src/tags/entities/tag.entity';
import { CreateTagDto } from 'src/tags/dto/create-tag.dto';
import { createTagMock } from 'src/test/factories/tag.factory';
import { createTaskMock } from 'src/test/factories/task.factory';
import { UpdateTagDto } from 'src/tags/dto/update-tag.dto';

describe('TagsService', () => {
  let service: TagsService;
  let tagsReposirory: jest.Mocked<TagsScopedRepository>;
  let taskRepository: jest.Mocked<Repository<Task>>;

  beforeEach(async () => {
    const mockTagsRepo = createMockRepo<Tag>();
    const mockTaskRepo = createMockRepo<Task>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        {
          provide: TagsScopedRepository,
          useValue: mockTagsRepo,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepo,
        },
      ],
    }).compile();
    service = module.get<TagsService>(TagsService);
    tagsReposirory = module.get(TagsScopedRepository);
    taskRepository = module.get(getRepositoryToken(Task));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const expectFindOneCalledWithId = (id: string) => {
    expect(tagsReposirory.findOne).toHaveBeenCalledWith({
      where: { id },
    });
  };

  describe('create', () => {
    it('should create a tag', async () => {
      const dto: CreateTagDto = {
        name: 'tags can have any name',
        task: 'task-id-123',
      };
      const userId = 'user-id-123';
      const existingTask = createTaskMock({ id: dto.task });
      const createdTag = createTagMock({
        name: dto.name,
        task: existingTask,
      });

      taskRepository.findOne.mockResolvedValue(existingTask);
      tagsReposirory.save.mockResolvedValue(createdTag);
      const result = await service.create(dto, userId);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.task, user: { id: userId } },
      });
      expect(tagsReposirory.save).toHaveBeenCalledWith({
        name: dto.name,
        task: { id: dto.task },
      });

      expect(result).toEqual(createdTag);
    });
    it('should throw if forbidden task', async () => {
      const dto: CreateTagDto = {
        name: 'Tags can have any name',
        task: 'invalid task-id-123',
      };
      const userId = 'user-id-123';

      taskRepository.findOne.mockResolvedValue(null);
      await expect(service.create(dto, userId)).rejects.toThrow(
        ForbiddenException,
      );

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: dto.task,
          user: { id: userId },
        },
      });
      expect(tagsReposirory.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it("should find all user's tags", async () => {
      const tags = [createTagMock()];

      tagsReposirory.find.mockResolvedValue(tags);

      const result = await service.findAll();

      expect(tagsReposirory.find).toHaveBeenCalledWith();
      expect(result).toEqual(tags);
    });
  });

  describe('findOne', () => {
    it("should find a user's tag by id", async () => {
      const tag = createTagMock();

      tagsReposirory.findOne.mockResolvedValue(tag);

      const result = await service.findOne(tag.id);

      expectFindOneCalledWithId(tag.id);
      expect(result).toEqual(tag);
    });

    it('should throw NotFoundException if taks does not exist', async () => {
      const invalidId = 'non-existent-id';
      tagsReposirory.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );

      expectFindOneCalledWithId(invalidId);
    });
  });

  describe('findTaskTags', () => {
    it("It should return a task's tags", async () => {
      const task = createTaskMock();
      const tags = createTagMock({ task: task });

      tagsReposirory.find.mockResolvedValue([tags]);
      const result = await service.findTaskTags(task.id);

      expect(tagsReposirory.find).toHaveBeenCalledWith({
        where: { task: { id: task.id } },
      });
      expect(result).toEqual([tags]);
    });
  });

  describe('update', () => {
    const dto: UpdateTagDto = {
      name: 'Super Name',
      task: 'another task-id-123',
    };
    const userId = 'user-id-123';
    it("should find a user's tag by id and update", async () => {
      const existingTag = createTagMock({ name: 'I was tagging' });
      const existingTask = createTaskMock({ id: dto.task });
      const updatedTag = { ...existingTag, ...dto };

      taskRepository.findOne.mockResolvedValue(existingTask);
      tagsReposirory.findOne.mockResolvedValue(existingTag);
      tagsReposirory.save.mockResolvedValue(updatedTag);

      const result = await service.update(existingTag.id, dto, userId);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: dto.task,
          user: { id: userId },
        },
      });
      expectFindOneCalledWithId(existingTag.id);
      expect(tagsReposirory.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: existingTag.id,
          name: dto.name,
          task: dto.task,
        }),
      );
      expect(result).toEqual(updatedTag);
    });

    it('should throw NotFoundException if task does not exist', async () => {
      const existingTask = createTaskMock({ id: dto.task });
      const invalidId = 'not an id';

      taskRepository.findOne.mockResolvedValue(existingTask);
      tagsReposirory.findOne.mockResolvedValue(null);

      await expect(service.update(invalidId, dto, userId)).rejects.toThrow(
        NotFoundException,
      );

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.task, user: { id: userId } },
      });
      expectFindOneCalledWithId(invalidId);
      expect(tagsReposirory.save).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if task id is invalid', async () => {
      taskRepository.findOne.mockResolvedValue(null);

      await expect(service.update('task-id', dto, userId)).rejects.toThrow(
        ForbiddenException,
      );

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: dto.task,
          user: { id: userId },
        },
      });
      expect(tagsReposirory.findOne).not.toHaveBeenCalled();
      expect(tagsReposirory.save).not.toHaveBeenCalled();
    });

    it('should update without task validation if task is not provided', async () => {
      const dto: UpdateTagDto = {
        name: 'repeating nonsense',
      };
      const existingTag = createTagMock();
      const updatedTag = { ...existingTag, ...dto };

      tagsReposirory.findOne.mockResolvedValue(existingTag);
      tagsReposirory.save.mockResolvedValue(updatedTag);

      const result = await service.update(existingTag.id, dto, userId);

      expect(taskRepository.findOne).not.toHaveBeenCalled();
      expectFindOneCalledWithId(existingTag.id);
      expect(tagsReposirory.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: existingTag.id,
          name: dto.name,
        }),
      );
      expect(result).toEqual(updatedTag);
    });
  });

  describe('remove', () => {
    it('Should remove a tag', async () => {
      const tag = createTagMock();

      tagsReposirory.findOne.mockResolvedValue(tag);
      tagsReposirory.softRemove.mockResolvedValue(true);
      const result = await service.remove(tag.id);

      expectFindOneCalledWithId(tag.id);
      expect(tagsReposirory.softRemove).toHaveBeenCalledWith(tag);
      expect(result).toEqual({ message: 'Successfully' });
    });

    it('should throw NotFoundException if tag does not exist', async () => {
      const invalidId = 'non-existent-id';
      tagsReposirory.findOne.mockResolvedValue(null);

      await expect(service.remove(invalidId)).rejects.toThrow(
        NotFoundException,
      );

      expectFindOneCalledWithId(invalidId);
      expect(tagsReposirory.softRemove).not.toHaveBeenCalled();
    });
  });
});
