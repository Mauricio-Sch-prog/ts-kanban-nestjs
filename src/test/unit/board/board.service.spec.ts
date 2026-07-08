import { Test, TestingModule } from '@nestjs/testing';
import { BoardService } from '../../../board/board.service';
import { BoardScopedRepository } from 'src/board/board.scoped.repository';
import { Board } from 'src/board/entities/board.entity';
import { createMockRepo } from 'src/test/base.repo.mock';

describe('BoardService', () => {
  let service: BoardService;

  const mockBoardRepo = createMockRepo<Board>();

  beforeEach(async () => {
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
