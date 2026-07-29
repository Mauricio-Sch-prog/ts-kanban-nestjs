import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { createUserMock } from 'src/test/factories/user.factory';
import { TaskController } from 'src/task/task.controller';
import { TaskService } from 'src/task/task.service';
import { CreateTaskDto } from 'src/task/dto/create-task.dto';
import { createTaskMock } from 'src/test/factories/task.factory';
import { UpdateTaskDto } from 'src/task/dto/update-task.dto';

const validId = '550e8400-e29b-41d4-a716-446655440000';

describe('TaskController', () => {
  let controller: TaskController;

  const mockTaskService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findLaneTasks: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<TaskController>(TaskController);
  });

  describe('create', () => {
    const dto: CreateTaskDto = {
      title: 'Tasks can have any name',
    };
    it('should create a task', async () => {
      const mockTask = createTaskMock();
      const mockUser = createUserMock();

      mockTaskService.create.mockResolvedValue(mockTask);

      const result = await controller.create(dto, mockUser);

      expect(mockTaskService.create).toHaveBeenCalledWith(dto, mockUser.id);
      expect(result).toEqual(mockTask);
    });
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      const mockTask = createTaskMock();
      mockTaskService.findAll.mockResolvedValue([mockTask]);

      const result = await controller.findAll();

      expect(mockTaskService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockTask]);
    });
  });

  describe('findOne', () => {
    it('should return a single task', async () => {
      const mockTask = createTaskMock();
      mockTaskService.findOne.mockResolvedValue(mockTask);

      const result = await controller.findOne(validId);

      expect(mockTaskService.findOne).toHaveBeenCalledWith(validId);
      expect(result).toEqual(mockTask);
    });
  });

  describe('findBoardLanes', () => {
    it("Should return a lane's tasks", async () => {
      const mockTask = createTaskMock();
      const laneId = 'uuid-laneId';
      mockTaskService.findLaneTasks.mockResolvedValue([mockTask]);

      const result = await controller.findLaneTasks(laneId);

      expect(mockTaskService.findLaneTasks).toHaveBeenCalledWith(laneId);
      expect(result).toEqual([mockTask]);
    });
  });

  describe('update', () => {
    it('should update and return taks', async () => {
      const dto: UpdateTaskDto = {
        title: 'titlistck',
        lane: 'another laneId',
      };
      const mockTask = createTaskMock();
      const user = createUserMock();

      const updatedTask = { ...mockTask, ...dto };

      mockTaskService.update.mockResolvedValue(updatedTask);

      const result = await controller.update(validId, dto, user);

      expect(mockTaskService.update).toHaveBeenCalledWith(
        validId,
        dto,
        user.id,
      );
      expect(result).toEqual(updatedTask);
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      mockTaskService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(validId);

      expect(mockTaskService.remove).toHaveBeenCalledWith(validId);
      expect(result).toBeUndefined();
    });
  });
});
