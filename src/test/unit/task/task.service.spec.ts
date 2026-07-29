import { Test, TestingModule } from '@nestjs/testing';
import { createMockRepo } from 'src/test/base.repo.mock';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { createLaneMock } from 'src/test/factories/lane.factory';
import { Repository } from 'typeorm';
import { Lane } from 'src/lane/entities/lane.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaskService } from 'src/task/task.service';
import { TaskScopedRepository } from 'src/task/task.scoped.repository';
import { Task } from 'src/task/entities/task.entity';
import { CreateTaskDto } from 'src/task/dto/create-task.dto';
import { createTaskMock } from 'src/test/factories/task.factory';
import { UpdateTaskDto } from 'src/task/dto/update-task.dto';

describe('TaskService', () => {
  let service: TaskService;
  let taskRepository: jest.Mocked<TaskScopedRepository>;
  let laneRepository: jest.Mocked<Repository<Lane>>;

  beforeEach(async () => {
    const mockTaskRepo = createMockRepo<Task>();
    const mockLaneRepo = createMockRepo<Lane>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: TaskScopedRepository,
          useValue: mockTaskRepo,
        },
        {
          provide: getRepositoryToken(Lane),
          useValue: mockLaneRepo,
        },
      ],
    }).compile();
    service = module.get<TaskService>(TaskService);
    taskRepository = module.get(TaskScopedRepository);
    laneRepository = module.get(getRepositoryToken(Lane));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const expectFindOneCalledWithId = (id: string) => {
    expect(taskRepository.findOne).toHaveBeenCalledWith({
      where: { id },
    });
  };

  describe('create', () => {
    it('should create a task', async () => {
      const dto: CreateTaskDto = {
        title: 'tasks can have any name',
        lane: 'lane-id-123',
      };
      const userId = 'user-id-123';
      const existingLane = createLaneMock({ id: dto.lane });
      const createdTask = createTaskMock({
        title: dto.title,
        lane: existingLane,
      });

      laneRepository.findOne.mockResolvedValue(existingLane);
      taskRepository.save.mockResolvedValue(createdTask);
      const result = await service.create(dto, userId);

      expect(laneRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.lane, user: { id: userId } },
      });
      expect(taskRepository.save).toHaveBeenCalledWith({
        title: dto.title,
        lane: { id: dto.lane },
      });

      expect(result).toEqual(createdTask);
    });
    it('should throw if forbidden lane', async () => {
      const dto: CreateTaskDto = {
        title: 'Tasks can have any name',
        lane: 'invalid lane-id-123',
      };
      const userId = 'user-id-123';

      laneRepository.findOne.mockResolvedValue(null);
      await expect(service.create(dto, userId)).rejects.toThrow(
        ForbiddenException,
      );

      expect(laneRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: dto.lane,
          user: { id: userId },
        },
      });
      expect(taskRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it("should find all user's tasks", async () => {
      const tasks = [createTaskMock()];

      taskRepository.find.mockResolvedValue(tasks);

      const result = await service.findAll();

      expect(taskRepository.find).toHaveBeenCalledWith();
      expect(result).toEqual(tasks);
    });
  });

  describe('findOne', () => {
    it("should find a user's task by id", async () => {
      const tasl = createTaskMock();

      taskRepository.findOne.mockResolvedValue(tasl);

      const result = await service.findOne(tasl.id);

      expectFindOneCalledWithId(tasl.id);
      expect(result).toEqual(tasl);
    });

    it('should throw NotFoundException if taks does not exist', async () => {
      const invalidId = 'non-existent-id';
      taskRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );

      expectFindOneCalledWithId(invalidId);
    });
  });

  describe('findLaneTasks', () => {
    it("It should return a board's lanes", async () => {
      const lane = createLaneMock();
      const task = createTaskMock({ lane: lane });

      taskRepository.find.mockResolvedValue([task]);
      const result = await service.findLaneTasks(lane.id);

      expect(taskRepository.find).toHaveBeenCalledWith({
        where: { lane: { id: lane.id } },
      });
      expect(result).toEqual([task]);
    });
  });

  describe('update', () => {
    const dto: UpdateTaskDto = {
      title: 'Super Title',
      lane: 'another lane-id-123',
    };
    const userId = 'user-id-123';
    it("should find a user's task by id and update", async () => {
      const existingTask = createTaskMock({ title: 'I was tasking' });
      const existingLane = createLaneMock({ id: dto.lane });
      const updatedTask = { ...existingTask, ...dto };

      laneRepository.findOne.mockResolvedValue(existingLane);
      taskRepository.findOne.mockResolvedValue(existingTask);
      taskRepository.save.mockResolvedValue(updatedTask);

      const result = await service.update(existingTask.id, dto, userId);

      expect(laneRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: dto.lane,
          user: { id: userId },
        },
      });
      expectFindOneCalledWithId(existingTask.id);
      expect(taskRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: existingTask.id,
          title: dto.title,
          lane: dto.lane,
        }),
      );
      expect(result).toEqual(updatedTask);
    });

    it('should throw NotFoundException if task does not exist', async () => {
      const existingLane = createLaneMock({ id: dto.lane });
      const invalidId = 'not an id';

      laneRepository.findOne.mockResolvedValue(existingLane);
      taskRepository.findOne.mockResolvedValue(null);

      await expect(service.update(invalidId, dto, userId)).rejects.toThrow(
        NotFoundException,
      );

      expect(laneRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.lane, user: { id: userId } },
      });
      expectFindOneCalledWithId(invalidId);
      expect(taskRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if lane id is invalid', async () => {
      laneRepository.findOne.mockResolvedValue(null);

      await expect(service.update('task-id', dto, userId)).rejects.toThrow(
        ForbiddenException,
      );

      expect(laneRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: dto.lane,
          user: { id: userId },
        },
      });
      expect(taskRepository.findOne).not.toHaveBeenCalled();
      expect(taskRepository.save).not.toHaveBeenCalled();
    });

    it('should update without lane validation if lane is not provided', async () => {
      const dto = {
        title: 'repeating nonsense',
      };
      const existingTask = createTaskMock();
      const updatedTask = { ...existingTask, ...dto };

      taskRepository.findOne.mockResolvedValue(existingTask);
      taskRepository.save.mockResolvedValue(updatedTask);

      const result = await service.update(existingTask.id, dto, userId);

      expect(laneRepository.findOne).not.toHaveBeenCalled();
      expectFindOneCalledWithId(existingTask.id);
      expect(taskRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: existingTask.id,
          title: dto.title,
        }),
      );
      expect(result).toEqual(updatedTask);
    });
  });

  describe('remove', () => {
    it('Should remove a task', async () => {
      const task = createTaskMock();

      taskRepository.findOne.mockResolvedValue(task);
      taskRepository.softRemove.mockResolvedValue(true);
      const result = await service.remove(task.id);

      expectFindOneCalledWithId(task.id);
      expect(taskRepository.softRemove).toHaveBeenCalledWith(task);
      expect(result).toEqual({ message: 'Successfully' });
    });

    it('should throw NotFoundException if task does not exist', async () => {
      const invalidId = 'non-existent-id';
      taskRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(invalidId)).rejects.toThrow(
        NotFoundException,
      );

      expectFindOneCalledWithId(invalidId);
      expect(taskRepository.softRemove).not.toHaveBeenCalled();
    });
  });
});
