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

let cookies: string[];
let badCookies: string[];
describe('Board (e2e)', () => {
  let app: INestApplication;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await appFactory();
    await app.init();

    const res1 = await loginRequest(app);
    cookies = getCookies(res1);

    const res2 = await loginRequest(app);
    badCookies = getCookies(res2);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /board', () => {
    it('should send dto and succesfully create board', async () => {
      const res = await http()
        .post('/board')
        .set('Cookie', cookies)
        .send({
          name: 'a name for a new board',
        })
        .expect(201);

      const body = res.body as ApiResponse<Board>;
      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({
        name: 'a name for a new board',
      });
    });

    it('should refuse invalid dto', async () => {
      const res = await http()
        .post('/board')
        .set('Cookie', cookies)
        .send()
        .expect(400);

      const body = res.body as ErrorResponse;

      expect(body.success).toEqual(false);
    });

    it('should throw when no cookies', async () => {
      await expectUnauthorized(() =>
        http().post('/board').send({
          name: 'a name for a new board',
        }),
      );
    });
  });

  describe('GET /board', () => {
    it('Should succeed', async () => {
      const res = await http().get('/board').set('Cookie', cookies).expect(200);
      const body = res.body as ApiResponse<Board[]>;
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
    });
    it('should throw when no cookies', async () => {
      await expectUnauthorized(() => http().get('/board'));
    });
  });

  describe('GET /board:id', () => {
    it('Should receive a valid id', async () => {
      const board = await createBoard(app, cookies);

      const res = await http()
        .get(`/board/${board.id}`)
        .set('Cookie', cookies)
        .expect(200);
      const body = res.body as ApiResponse<Board>;

      expect(body.success).toBe(true);
    });

    it('should refuse not owned boards', async () => {
      await expectForbidden(
        app,
        createBoard,
        async (id: string, badCookies: string[]) => {
          return await http().get(`/board/${id}`).set('Cookie', badCookies);
        },
        cookies,
        badCookies,
      );
    });

    it('should throw when no cookies', async () => {
      const board = await createBoard(app, cookies);
      await expectUnauthorized(() => http().get(`/board/${board.id}`));
    });

    it('should throw when at invalid uuid', async () => {
      await expectBadRequest(() =>
        http().get('/board/invalid-uuid').set('Cookie', cookies),
      );
    });
  });

  describe('PATCH /board:id', () => {
    const dto = { name: 'updateBoard' };
    it('Should receive a valid id and valid dto', async () => {
      const board = await createBoard(app, cookies);

      const res = await http()
        .patch(`/board/${board.id}`)
        .send(dto)
        .set('Cookie', cookies)
        .expect(200);
      const body = res.body as ApiResponse<Board>;
      expect(body.success).toBe(true);
      expect(body.data.name).toBe('updateBoard');
    });

    it('should refuse not owned boards', async () => {
      await expectForbidden(
        app,
        createBoard,
        async (id: string, badCookies: string[]) => {
          return await http()
            .patch(`/board/${id}`)
            .send(dto)
            .set('Cookie', badCookies);
        },
        cookies,
        badCookies,
      );
    });

    it('should throw when no cookies', async () => {
      const board = await createBoard(app, cookies);
      await expectUnauthorized(() =>
        http().patch(`/board/${board.id}`).send(dto),
      );
    });

    it('should throw when at invalid uuid', async () => {
      await expectBadRequest(() =>
        http().patch('/board/invalid-uuid').send(dto).set('Cookie', cookies),
      );
    });
  });

  describe('DELETE /board:id', () => {
    it('Should receive a valid id', async () => {
      const board = await createBoard(app, cookies);

      const res = await http()
        .delete(`/board/${board.id}`)
        .set('Cookie', cookies)
        .expect(200);
      const body = res.body as ApiResponse<Board>;
      expect(body.data).toEqual({
        message: 'Succesfully',
      });
    });

    it('should refuse not owned boards', async () => {
      await expectForbidden(
        app,
        createBoard,
        async (id: string, badCookies: string[]) => {
          return await http().delete(`/board/${id}`).set('Cookie', badCookies);
        },
        cookies,
        badCookies,
      );
    });

    it('should throw when no cookies', async () => {
      const board = await createBoard(app, cookies);
      await expectUnauthorized(() => http().delete(`/board/${board.id}`));
    });

    it('should throw when at invalid uuid', async () => {
      await expectBadRequest(() =>
        http().delete('/board/invalid-uuid').set('Cookie', cookies),
      );
    });
  });
});
