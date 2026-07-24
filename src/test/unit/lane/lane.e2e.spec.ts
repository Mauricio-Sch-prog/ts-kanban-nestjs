import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ErrorResponse } from 'src/common/type/error.response';
import { appFactory } from 'src/test/factories/app.factory';
import { ApiResponse } from 'src/common/type/api.response';
import { Board } from 'src/board/entities/board.entity';
import { getCookies } from 'src/test/utils/getCookies';
import { expectUnauthorized } from 'src/test/utils/expect/expectUnauthorized';
import { createBoard } from 'src/test/utils/createRequests/createBoard';
import { loginRequest } from 'src/test/utils/loginRequest';
import { expectForbidden } from 'src/test/utils/expect/expectForbidden';
import { expectBadRequest } from 'src/test/utils/expect/expectBadRequest';
import { Lane } from 'src/lane/entities/lane.entity';
import { createLane } from 'src/test/utils/createRequests/createLane';

let board: Board;
let cookies: string[];
let badCookies: string[];
describe('Lane (e2e)', () => {
  let app: INestApplication;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await appFactory();
    await app.init();

    const res1 = await loginRequest(app);
    cookies = getCookies(res1);
    board = await createBoard(app, cookies);

    const res2 = await loginRequest(app);
    badCookies = getCookies(res2);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /lane', () => {
    it('should send dto and succesfully create lane', async () => {
      const res = await http()
        .post('/lane')
        .set('Cookie', cookies)
        .send({
          name: 'a name for a new lane',
          board: board.id,
        })
        .expect(201);

      const body = res.body as ApiResponse<Lane>;
      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({
        name: 'a name for a new lane',
        board: { id: board.id },
      });
    });

    it('should refuse invalid dto', async () => {
      const res = await http()
        .post('/lane')
        .set('Cookie', cookies)
        .send()
        .expect(400);

      const body = res.body as ErrorResponse;

      expect(body.success).toEqual(false);
    });

    it('should throw when no cookies', async () => {
      await expectUnauthorized(() =>
        http().post('/lane').send({
          name: 'a name for a new lane',
          board: board.id,
        }),
      );
    });

    it('should refuse not owned boards', async () => {
      await expectForbidden(
        async () => {
          return createBoard(app, cookies);
        },
        async (id: string, badCookies: string[]) => {
          return await http()
            .post(`/lane`)
            .send({
              name: 'a name for a new lane',
              board: id,
            })
            .set('Cookie', badCookies);
        },
        badCookies,
      );
    });
  });

  describe('GET /lane', () => {
    it('Should succeed', async () => {
      const res = await http().get('/lane').set('Cookie', cookies).expect(200);
      const body = res.body as ApiResponse<Lane[]>;
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should throw when no cookies', async () => {
      await expectUnauthorized(() => http().get('/lane'));
    });
  });

  describe('GET /lane:id', () => {
    it('Should receive a valid id', async () => {
      const lane = await createLane(app, cookies, board.id);

      const res = await http()
        .get(`/lane/${lane.id}`)
        .set('Cookie', cookies)
        .expect(200);
      const body = res.body as ApiResponse<Lane>;

      expect(body.success).toBe(true);
    });

    it('should refuse not owned lanes', async () => {
      await expectForbidden(
        async () => {
          return await createLane(app, cookies, board.id);
        },
        async (id: string, badCookies: string[]) => {
          return await http().get(`/lane/${id}`).set('Cookie', badCookies);
        },
        badCookies,
      );
    });

    it('should throw when no cookies', async () => {
      const lane = await createLane(app, cookies, board.id);
      await expectUnauthorized(() => http().get(`/lane/${lane.id}`));
    });

    it('should throw when at invalid uuid', async () => {
      await expectBadRequest(() =>
        http().get('/lane/invalid-uuid').set('Cookie', cookies),
      );
    });
  });

  describe('GET /lane/board:id/lanes', () => {
    it('Should receive a valid id', async () => {
      await createLane(app, cookies, board.id);

      const res = await http()
        .get(`/lane/board/${board.id}/lanes`)
        .set('Cookie', cookies)
        .expect(200);
      const body = res.body as ApiResponse<Lane[]>;

      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should refuse not owned board', async () => {
      await expectForbidden(
        async () => {
          return await createBoard(app, cookies);
        },
        async (id: string, badCookies: string[]) => {
          return await http()
            .get(`/lane/board/${id}/lanes`)
            .set('Cookie', badCookies);
        },
        badCookies,
      );
    });

    it('should throw when no cookies', async () => {
      await expectUnauthorized(() =>
        http().get(`/lane/board/${board.id}/lanes`),
      );
    });

    it('should throw when at invalid uuid', async () => {
      await expectBadRequest(() =>
        http().get('/lane/board/invalid-uuid/lanes').set('Cookie', cookies),
      );
    });
  });

  describe('PATCH /lane:id', () => {
    const dto = { name: 'updateLane' };
    it('Should receive a valid id and valid dto', async () => {
      const lane = await createLane(app, cookies, board.id);
      const res = await http()
        .patch(`/lane/${lane.id}`)
        .send(dto)
        .set('Cookie', cookies)
        .expect(200);
      const body = res.body as ApiResponse<Lane>;
      expect(body.success).toBe(true);
      expect(body.data.name).toBe('updateLane');
    });

    it('Should refuse invalid dto', async () => {
      const lane = await createLane(app, cookies, board.id);
      const res = await http()
        .patch(`/lane/${lane.id}`)
        .send({ name: '' })
        .set('Cookie', cookies)
        .expect(400);
      const body = res.body as ErrorResponse;
      expect(body.success).toBe(false);
      expect(body.error).toBe('BadRequestException');
    });

    it('should refuse not owned lanes', async () => {
      await expectForbidden(
        async () => {
          return await createLane(app, cookies, board.id);
        },
        async (id: string, badCookies: string[]) => {
          return await http()
            .patch(`/lane/${id}`)
            .send(dto)
            .set('Cookie', badCookies);
        },
        badCookies,
      );
    });

    it('should throw when no cookies', async () => {
      const lane = await createLane(app, cookies, board.id);
      await expectUnauthorized(() =>
        http().patch(`/lane/${lane.id}`).send(dto),
      );
    });

    it('should throw when at invalid uuid', async () => {
      await expectBadRequest(() =>
        http().patch('/lane/invalid-uuid').send(dto).set('Cookie', cookies),
      );
    });
  });

  describe('DELETE /lane:id', () => {
    it('Should receive a valid id', async () => {
      const lane = await createLane(app, cookies, board.id);
      const res = await http()
        .delete(`/lane/${lane.id}`)
        .set('Cookie', cookies)
        .expect(200);
      const body = res.body as ApiResponse<{ message: string }>;
      expect(body.data).toEqual({
        message: 'Succesfully',
      });
    });
    it('should refuse not owned lanes', async () => {
      await expectForbidden(
        async () => {
          return await createLane(app, cookies, board.id);
        },
        async (id: string, badCookies: string[]) => {
          return await http().delete(`/lane/${id}`).set('Cookie', badCookies);
        },
        badCookies,
      );
    });
    it('should throw when no cookies', async () => {
      const lane = await createLane(app, cookies, board.id);
      await expectUnauthorized(() => http().delete(`/lane/${lane.id}`));
    });
    it('should throw when at invalid uuid', async () => {
      await expectBadRequest(() =>
        http().delete('/lane/invalid-uuid').set('Cookie', cookies),
      );
    });
  });
});
