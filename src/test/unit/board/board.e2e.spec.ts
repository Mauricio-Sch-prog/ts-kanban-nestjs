import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ErrorResponse } from 'src/common/type/error.response';
import { createBoardMock } from 'src/test/factories/board.factory';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { BoardService } from 'src/board/board.service';
import { BoardController } from 'src/board/board.controller';
import { OwnershipGuard } from 'src/common/guard/owrnership.guard';

jest.mock('src/auth/guards/auth.guard', () => ({
  AuthGuard: () => ({
    canActivate: jest.fn(() => true),
  }),
}));

jest.mock('src/common/guard/owrnership.guard', () => ({
  AuthGuard: () => ({
    canActivate: jest.fn(() => true),
  }),
}));

let mockBoardService = {
  findOne: jest.fn(),
  remove: jest.fn(),
};

describe('BoardController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    mockBoardService = {
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
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
      .overrideGuard(OwnershipGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /board/:id', () => {
    it('should accept a valid UUID', async () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';

      const mockBoard = createBoardMock({ id: validUuid });
      mockBoardService.findOne.mockResolvedValue(mockBoard);

      const response = await request(app.getHttpServer())
        .get(`/board/${validUuid}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: mockBoard.id,
          name: mockBoard.name,
        }),
      );
      expect(mockBoardService.findOne).toHaveBeenCalledWith(validUuid);
    });

    it('should reject an invalid UUID', async () => {
      const invalidUuid = 'not-a-uuid';

      const response = await request(app.getHttpServer())
        .get(`/board/${invalidUuid}`)
        .expect(400);

      const body = response.body as ErrorResponse;

      expect(body.message).toContain('Validation failed');
    });
  });

  describe('DELETE /board/:id', () => {
    it('should accept a valid UUID', async () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      mockBoardService.remove.mockResolvedValue({});

      const response = await request(app.getHttpServer())
        .delete(`/board/${validUuid}`)
        .expect(200);

      expect(response.body).toEqual({});
      expect(mockBoardService.remove).toHaveBeenCalledWith(validUuid);
    });
  });

  it('should reject an invalid UUID', async () => {
    const invalidUuid = 'not-a-uuid';

    const response = await request(app.getHttpServer())
      .delete(`/board/${invalidUuid}`)
      .expect(400);

    const body = response.body as ErrorResponse;

    expect(body.message).toContain('Validation failed');
  });
});
