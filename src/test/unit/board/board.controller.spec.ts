import { Test, TestingModule } from '@nestjs/testing';
import { BoardController } from 'src/board/board.controller';
import { BoardService } from 'src/board/board.service';
import { CreateBoardDto } from 'src/board/dto/create-board.dto';
import { createBoardMock } from 'src/test/factories/board.factory';
import { UpdateBoardDto } from 'src/board/dto/update-board.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

jest.mock('src/auth/guards/auth.guard', () => ({
  AuthGuard: () => ({
    canActivate: jest.fn(() => true),
  }),
}));

describe('BoardController', () => {
  let controller: BoardController;

  const mockBoardService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardController],
      providers: [
        {
          provide: BoardService,
          useValue: mockBoardService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<BoardController>(BoardController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto: CreateBoardDto = {
      name: 'Boards can have any name',
    };
    it('should create a board', async () => {
      const mockBoard = createBoardMock();

      mockBoardService.create.mockResolvedValue(mockBoard);

      const result = await controller.create(dto);

      expect(mockBoardService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockBoard);
    });
  });

  describe('findAll', () => {
    it('should return an array of boards', async () => {
      const mockBoard = createBoardMock();
      mockBoardService.findAll.mockResolvedValue([mockBoard]);

      const result = await controller.findAll();

      expect(mockBoardService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockBoard]);
    });
  });

  describe('findOne', () => {
    it('should return a single board', async () => {
      const mockBoard = createBoardMock();
      mockBoardService.findOne.mockResolvedValue(mockBoard);

      const result = await controller.findOne('uuid-123');

      expect(mockBoardService.findOne).toHaveBeenCalledWith('uuid-123');
      expect(result).toEqual(mockBoard);
    });
  });

  describe('update', () => {
    it('should update and return board', async () => {
      const dto: UpdateBoardDto = {
        name: 'Boards can have any name',
      };
      const mockBoard = createBoardMock();

      const updateBoard = { ...mockBoard, ...dto };

      mockBoardService.update.mockResolvedValue(updateBoard);

      const result = await controller.update('uuid-123', dto);

      expect(mockBoardService.update).toHaveBeenCalledWith('uuid-123', dto);
      expect(result).toEqual(updateBoard);
    });
  });

  describe('remove', () => {
    it('should remove a board', async () => {
      mockBoardService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('uuid-123');

      expect(mockBoardService.remove).toHaveBeenCalledWith('uuid-123');
      expect(result).toBeUndefined();
    });
  });
});
