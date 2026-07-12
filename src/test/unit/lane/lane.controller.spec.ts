import { Test, TestingModule } from '@nestjs/testing';
import { createLaneMock } from 'src/test/factories/lane.factory';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { LaneController } from 'src/lane/lane.controller';
import { LaneService } from 'src/lane/lane.service';
import { CreateLaneDto } from 'src/lane/dto/create-lane.dto';
import { createUserMock } from 'src/test/factories/user.factory';
import { UpdateLaneDto } from 'src/lane/dto/update-lane.dto';

const validId = 'uuid-123';

describe('LaneController', () => {
  let controller: LaneController;

  const mockLaneService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBoardLanes: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LaneController],
      providers: [
        {
          provide: LaneService,
          useValue: mockLaneService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<LaneController>(LaneController);
  });

  describe('create', () => {
    const dto: CreateLaneDto = {
      name: 'Lanes can have any name',
    };
    it('should create a lane', async () => {
      const mockLane = createLaneMock();
      const mockUser = createUserMock();

      mockLaneService.create.mockResolvedValue(mockLane);

      const result = await controller.create(dto, mockUser);

      expect(mockLaneService.create).toHaveBeenCalledWith(dto, mockUser.id);
      expect(result).toEqual(mockLane);
    });
  });

  describe('findAll', () => {
    it('should return an array of lanes', async () => {
      const mockLane = createLaneMock();
      mockLaneService.findAll.mockResolvedValue([mockLane]);

      const result = await controller.findAll();

      expect(mockLaneService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockLane]);
    });
  });

  describe('findOne', () => {
    it('should return a single lane', async () => {
      const mockLane = createLaneMock();
      mockLaneService.findOne.mockResolvedValue(mockLane);

      const result = await controller.findOne(validId);

      expect(mockLaneService.findOne).toHaveBeenCalledWith(validId);
      expect(result).toEqual(mockLane);
    });
  });

  describe('findBoardLanes', () => {
    it("Should return a board's lanes", async () => {
      const mockLane = createLaneMock();
      const boardId = 'boardId';
      mockLaneService.findBoardLanes.mockResolvedValue([mockLane]);

      const result = await controller.findBoardLanes(boardId);

      expect(mockLaneService.findBoardLanes).toHaveBeenCalledWith(boardId);
      expect(result).toEqual([mockLane]);
    });
  });

  describe('update', () => {
    it('should update and return lane', async () => {
      const dto: UpdateLaneDto = {
        name: 'Lanes can have any name',
        board: 'another boardId',
      };
      const mockLane = createLaneMock();
      const user = createUserMock();

      const updatedLane = { ...mockLane, ...dto };

      mockLaneService.update.mockResolvedValue(updatedLane);

      const result = await controller.update(validId, dto, user);

      expect(mockLaneService.update).toHaveBeenCalledWith(
        validId,
        dto,
        user.id,
      );
      expect(result).toEqual(updatedLane);
    });
  });

  describe('remove', () => {
    it('should remove a lane', async () => {
      mockLaneService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(validId);

      expect(mockLaneService.remove).toHaveBeenCalledWith(validId);
      expect(result).toBeUndefined();
    });
  });
});
