import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UserController } from 'src/user/user.controller';
import { UserService } from 'src/user/user.service';
import { createUserMock } from 'src/test/factories/user.factory';
import { ErrorResponse } from 'src/common/type/error.response';
let mockUserService = {
  findOne: jest.fn(),
  remove: jest.fn(),
};

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    mockUserService = {
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /user/:id', () => {
    it('should accept a valid UUID', async () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';

      const mockUser = createUserMock({ id: validUuid });
      mockUserService.findOne.mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .get(`/user/${validUuid}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
        }),
      );
      expect(mockUserService.findOne).toHaveBeenCalledWith(validUuid);
    });

    it('should reject an invalid UUID', async () => {
      const invalidUuid = 'not-a-uuid';

      const response = await request(app.getHttpServer())
        .get(`/user/${invalidUuid}`)
        .expect(400);

      const body = response.body as ErrorResponse;

      expect(body.message).toContain('Validation failed');
    });
  });

  describe('DELETE /user/:id', () => {
    it('should accept a valid UUID', async () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      mockUserService.remove.mockResolvedValue({});

      const response = await request(app.getHttpServer())
        .delete(`/user/${validUuid}`)
        .expect(200);

      expect(response.body).toEqual({});
      expect(mockUserService.remove).toHaveBeenCalledWith(validUuid);
    });
  });
});
