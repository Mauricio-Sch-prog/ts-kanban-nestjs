import { Test, TestingModule } from '@nestjs/testing';
import { BoardService } from '../../../board/board.service';
import { BoardScopedRepository } from 'src/board/board.scoped.repository';
import { Board } from 'src/board/entities/board.entity';
import { createMockRepo } from 'src/test/base.repo.mock';
import { CreateBoardDto } from 'src/board/dto/create-board.dto';
import { createBoardMock } from 'src/test/factories/board.factory';
import { UpdateBoardDto } from 'src/board/dto/update-board.dto';
import { NotFoundException } from '@nestjs/common';

describe('BoardService', () => {
  let service: BoardService;
  let repository: jest.Mocked<BoardScopedRepository>;

  beforeEach(async () => {
    const mockBoardRepo = createMockRepo<Board>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        {
          provide: BoardScopedRepository,
          useValue: mockBoardRepo,
        },
      ],
    }).compile();
    service = module.get<BoardService>(BoardService);
    repository = module.get(BoardScopedRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const expectFindOneCalledWithId = (id: string) => {
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id },
    });
  };

  describe('create', () => {
    it('should create a board', async () => {
      const dto: CreateBoardDto = {
        name: 'Boards can have any name',
      };
      const createdBoard = createBoardMock({ ...dto });

      repository.save.mockResolvedValue(createdBoard);

      const result = await service.create(dto);
      expect(repository.save).toHaveBeenCalledWith(dto);
      expect(result).toEqual(createdBoard);
    });
  });

  describe('findAll', () => {
    it("should find all user's boards", async () => {
      const boards = [createBoardMock()];

      repository.find.mockResolvedValue(boards);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith();
      expect(result).toEqual(boards);
    });
  });

  describe('findOne', () => {
    it("should find a user's board by id", async () => {
      const board = createBoardMock();

      repository.findOne.mockResolvedValue(board);

      const result = await service.findOne(board.id);

      expectFindOneCalledWithId(board.id);
      expect(result).toEqual(board);
    });

    it('should throw NotFoundException if board does not exist', async () => {
      const invalidId = 'non-existent-id';
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );

      expectFindOneCalledWithId(invalidId);
    });
  });

  describe('update', () => {
    it("should find a user's board by id and update", async () => {
      const dto: UpdateBoardDto = {
        name: 'Boards can have any name',
      };
      const existingBoard = createBoardMock({ name: 'I was here all along' });
      const updatedBoard = { ...existingBoard, ...dto };

      repository.findOne.mockResolvedValue(existingBoard);
      repository.save.mockResolvedValue(updatedBoard);

      const result = await service.update(existingBoard.id, dto);

      expectFindOneCalledWithId(existingBoard.id);
      expect(repository.save).toHaveBeenCalledWith(updatedBoard);
      expect(result).toEqual(updatedBoard);
    });

    it('should throw NotFoundException if board does not exist', async () => {
      const invalidId = 'non-existent-id';
      repository.findOne.mockResolvedValue(null);

      await expect(service.update(invalidId, { name: 'test' })).rejects.toThrow(
        NotFoundException,
      );

      expectFindOneCalledWithId(invalidId);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('Should remove a board', async () => {
      const board = createBoardMock();

      repository.findOne.mockResolvedValue(board);
      repository.softRemove.mockResolvedValue(true);
      const result = await service.remove(board.id);

      expectFindOneCalledWithId(board.id);
      expect(repository.softRemove).toHaveBeenCalledWith(board);
      expect(result).toEqual({ message: 'Succesfully' });
    });

    it('should throw NotFoundException if board does not exist', async () => {
      const invalidId = 'non-existent-id';
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(invalidId)).rejects.toThrow(
        NotFoundException,
      );

      expectFindOneCalledWithId(invalidId);
      expect(repository.softRemove).not.toHaveBeenCalled();
    });
  });
});
