import { Test, TestingModule } from '@nestjs/testing';
import { Board } from 'src/board/entities/board.entity';
import { createMockRepo } from 'src/test/base.repo.mock';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { LaneService } from 'src/lane/lane.service';
import { LaneScopedRepository } from 'src/lane/lane.scoped.repository';
import { CreateLaneDto } from 'src/lane/dto/create-lane.dto';
import { UpdateLaneDto } from 'src/lane/dto/update-lane.dto';
import { createLaneMock } from 'src/test/factories/lane.factory';
import { Repository } from 'typeorm';
import { createBoardMock } from 'src/test/factories/board.factory';
import { Lane } from 'src/lane/entities/lane.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('LaneService', () => {
  let service: LaneService;
  let laneRepository: jest.Mocked<LaneScopedRepository>;
  let boardRepository: jest.Mocked<Repository<Board>>;

  beforeEach(async () => {
    const mockBoardRepo = createMockRepo<Board>();
    const mockLaneRepo = createMockRepo<Lane>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LaneService,
        {
          provide: LaneScopedRepository,
          useValue: mockLaneRepo,
        },
        {
          provide: getRepositoryToken(Board),
          useValue: mockBoardRepo,
        },
      ],
    }).compile();
    service = module.get<LaneService>(LaneService);
    laneRepository = module.get(LaneScopedRepository);
    boardRepository = module.get(getRepositoryToken(Board));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const expectFindOneCalledWithId = (id: string) => {
    expect(laneRepository.findOne).toHaveBeenCalledWith({
      where: { id },
    });
  };

  describe('create', () => {
    it('should create a lane', async () => {
      const dto: CreateLaneDto = {
        name: 'Lanes can have any name',
        board: 'board-id-123',
      };
      const userId = 'user-id-123';
      const existingBoard = createBoardMock({ id: dto.board });
      const createdLane = createLaneMock({
        name: dto.name,
        board: existingBoard,
      });

      boardRepository.findOne.mockResolvedValue(existingBoard);
      laneRepository.save.mockResolvedValue(createdLane);
      const result = await service.create(dto, userId);

      expect(boardRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.board, user: { id: userId } },
      });
      expect(laneRepository.save).toHaveBeenCalledWith({
        name: dto.name,
        board: { id: dto.board },
      });

      expect(result).toEqual(createdLane);
    });
    it('should throw if forbidden board', async () => {
      const dto: CreateLaneDto = {
        name: 'Lanes can have any name',
        board: 'invalid board-id-123',
      };
      const userId = 'user-id-123';

      boardRepository.findOne.mockResolvedValue(null);
      await expect(service.create(dto, userId)).rejects.toThrow(
        ForbiddenException,
      );

      expect(boardRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: dto.board,
          user: { id: userId },
        },
      });
      expect(laneRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it("should find all user's lanes", async () => {
      const lanes = [createLaneMock()];

      laneRepository.find.mockResolvedValue(lanes);

      const result = await service.findAll();

      expect(laneRepository.find).toHaveBeenCalledWith();
      expect(result).toEqual(lanes);
    });
  });

  describe('findOne', () => {
    it("should find a user's lane by id", async () => {
      const lane = createLaneMock();

      laneRepository.findOne.mockResolvedValue(lane);

      const result = await service.findOne(lane.id);

      expectFindOneCalledWithId(lane.id);
      expect(result).toEqual(lane);
    });

    it('should throw NotFoundException if lane does not exist', async () => {
      const invalidId = 'non-existent-id';
      laneRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );

      expectFindOneCalledWithId(invalidId);
    });
  });

  describe('findBoardLanes', () => {
    it("It should return a board's lanes", async () => {
      const board = createBoardMock();
      const lane = createLaneMock({ board: board });

      laneRepository.find.mockResolvedValue([lane]);
      const result = await service.findBoardLanes(board.id);

      expect(laneRepository.find).toHaveBeenCalledWith({
        where: { board: { id: board.id } },
      });
      expect(result).toEqual([lane]);
    });
  });

  describe('update', () => {
    const dto: UpdateLaneDto = {
      name: 'Lanes can have any name',
      board: 'another board-id-123',
    };
    const userId = 'user-id-123';
    it("should find a user's lane by id and update", async () => {
      const existingLane = createLaneMock({ name: 'I was here all alane' });
      const existingBoard = createBoardMock({ id: dto.board });
      const updatedLane = { ...existingLane, ...dto };

      boardRepository.findOne.mockResolvedValue(existingBoard);
      laneRepository.findOne.mockResolvedValue(existingLane);
      laneRepository.save.mockResolvedValue(updatedLane);

      const result = await service.update(existingLane.id, dto, userId);

      expect(boardRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: dto.board,
          user: { id: userId },
        },
      });
      expectFindOneCalledWithId(existingLane.id);
      expect(laneRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: existingLane.id,
          name: dto.name,
          board: dto.board,
        }),
      );
      expect(result).toEqual(updatedLane);
    });

    it('should throw NotFoundException if lane does not exist', async () => {
      const existingBoard = createBoardMock({ id: dto.board });
      const invalidId = 'not an id';

      boardRepository.findOne.mockResolvedValue(existingBoard);
      laneRepository.findOne.mockResolvedValue(null);

      await expect(service.update(invalidId, dto, userId)).rejects.toThrow(
        NotFoundException,
      );

      expect(boardRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.board, user: { id: userId } },
      });
      expectFindOneCalledWithId(invalidId);
      expect(laneRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if board id is invalid', async () => {
      boardRepository.findOne.mockResolvedValue(null);

      await expect(service.update('lane-id', dto, userId)).rejects.toThrow(
        ForbiddenException,
      );

      expect(boardRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: dto.board,
          user: { id: userId },
        },
      });
      expect(laneRepository.findOne).not.toHaveBeenCalled();
      expect(laneRepository.save).not.toHaveBeenCalled();
    });

    it('should update without board validation if board is not provided', async () => {
      const dto = {
        name: 'repeating nonsense',
      };
      const existingLane = createLaneMock();
      const updatedLane = { ...existingLane, ...dto };

      laneRepository.findOne.mockResolvedValue(existingLane);
      laneRepository.save.mockResolvedValue(updatedLane);

      const result = await service.update(existingLane.id, dto, userId);

      expect(boardRepository.findOne).not.toHaveBeenCalled();
      expectFindOneCalledWithId(existingLane.id);
      expect(laneRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: existingLane.id,
          name: dto.name,
        }),
      );
      expect(result).toEqual(updatedLane);
    });
  });

  describe('remove', () => {
    it('Should remove a lane', async () => {
      const lane = createLaneMock();

      laneRepository.findOne.mockResolvedValue(lane);
      laneRepository.softRemove.mockResolvedValue(true);
      const result = await service.remove(lane.id);

      expectFindOneCalledWithId(lane.id);
      expect(laneRepository.softRemove).toHaveBeenCalledWith(lane);
      expect(result).toEqual({ message: 'Succesfully' });
    });

    it('should throw NotFoundException if lane does not exist', async () => {
      const invalidId = 'non-existent-id';
      laneRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(invalidId)).rejects.toThrow(
        NotFoundException,
      );

      expectFindOneCalledWithId(invalidId);
      expect(laneRepository.softRemove).not.toHaveBeenCalled();
    });
  });
});
