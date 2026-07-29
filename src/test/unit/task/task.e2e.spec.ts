import { INestApplication } from '@nestjs/common';
import request from 'supertest';
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
import { Task } from 'src/task/entities/task.entity';
import { expectInvalidDto } from 'src/test/utils/expect/expectInvalidDto';
import { createTask } from 'src/test/utils/createRequests/createTask';
import { ErrorResponse } from 'src/common/type/error.response';

let board: Board;
let lane: Lane;
let cookies: string[];
let badCookies: string[];
describe('Task (e2e)', () => {
  let app: INestApplication;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await appFactory();
    await app.init();

    const res1 = await loginRequest(app);
    cookies = getCookies(res1);

    const res2 = await loginRequest(app);
    badCookies = getCookies(res2);

    board = await createBoard(app, cookies);
    lane = await createLane(app, cookies, board.id);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /task', () => {
    it('should send dto and succesfully create task', async () => {
      const res = await http()
        .post('/task')
        .set('Cookie', cookies)
        .send({
          title: 'some task someone should do',
          lane: lane.id,
        })
        .expect(201);

      const body = res.body as ApiResponse<Task>;

      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({
        title: 'some task someone should do',
        lane: { id: lane.id },
      });
    });

    it('should refuse invalid dto', async () => {
      await expectInvalidDto(app, '/task', cookies);
    });

    it('should throw when no cookies', async () => {
      await expectUnauthorized(() =>
        http().post('/task').send({
          title: 'some task someone should do',
          lane: lane.id,
        }),
      );
    });

    it('should refuse not owned lanes', async () => {
      await expectForbidden(
        async () => {
          return createLane(app, cookies, board.id);
        },
        async (id: string, badCookies: string[]) => {
          return await http()
            .post(`/task`)
            .send({
              title: 'a name for a new task',
              lane: id,
            })
            .set('Cookie', badCookies);
        },
        badCookies,
      );
    });
  });

  describe('GET /task', () => {
    it('Should succeed', async () => {
      const res = await http().get('/task').set('Cookie', cookies).expect(200);
      const body = res.body as ApiResponse<Task[]>;
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });
    it('should throw when no cookies', async () => {
      await expectUnauthorized(() => http().get('/task'));
    });
  });

  describe('GET /task:id', () => {
    it('Should receive a valid id', async () => {
      const task = await createTask(app, cookies, lane.id);
      const res = await http()
        .get(`/task/${task.id}`)
        .set('Cookie', cookies)
        .expect(200);
      const body = res.body as ApiResponse<Task>;
      expect(body.success).toBe(true);
    });

    it('should refuse not owned tasks', async () => {
      await expectForbidden(
        async () => {
          return await createTask(app, cookies, lane.id);
        },
        async (id: string, badCookies: string[]) => {
          return await http().get(`/task/${id}`).set('Cookie', badCookies);
        },
        badCookies,
      );
    });
    it('should throw when no cookies', async () => {
      const task = await createTask(app, cookies, lane.id);
      await expectUnauthorized(() => http().get(`/task/${task.id}`));
    });
    it('should throw when at invalid uuid', async () => {
      await expectBadRequest(() =>
        http().get('/task/invalid-uuid').set('Cookie', cookies),
      );
    });
  });

  describe('GET /task/lane:id/tasks', () => {
    it('Should receive a valid id', async () => {
      await createTask(app, cookies, lane.id);
      const res = await http()
        .get(`/task/lane/${lane.id}/tasks`)
        .set('Cookie', cookies)
        .expect(200);
      const body = res.body as ApiResponse<Task[]>;
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });
    it('should refuse not owned lanes', async () => {
      await expectForbidden(
        async () => {
          return await createLane(app, cookies, board.id);
        },
        async (id: string, badCookies: string[]) => {
          return await http()
            .get(`/task/lane/${id}/tasks`)
            .set('Cookie', badCookies);
        },
        badCookies,
      );
    });
    it('should throw when no cookies', async () => {
      await expectUnauthorized(() => http().get(`/task/lane/${lane.id}/tasks`));
    });
    it('should throw when at invalid uuid', async () => {
      await expectBadRequest(() =>
        http().get('/task/lane/invalid-uuid/tasks').set('Cookie', cookies),
      );
    });
  });

  describe('PATCH /task:id', () => {
    const dto = { title: 'updated task title' };
    it('Should receive a valid id and valid dto', async () => {
      const task = await createTask(app, cookies, lane.id);
      const res = await http()
        .patch(`/task/${task.id}`)
        .send(dto)
        .set('Cookie', cookies)
        .expect(200);
      const body = res.body as ApiResponse<Task>;
      expect(body.success).toBe(true);
      expect(body.data.title).toBe('updated task title');
    });
    it('Should refuse invalid dto', async () => {
      const task = await createTask(app, cookies, lane.id);
      const res = await http()
        .patch(`/task/${task.id}`)
        .send({ title: '' })
        .set('Cookie', cookies)
        .expect(400);
      const body = res.body as ErrorResponse;
      expect(body.success).toBe(false);
      expect(body.error).toBe('BadRequestException');
    });
    it('should refuse not owned tasks', async () => {
      await expectForbidden(
        async () => {
          return await createTask(app, cookies, lane.id);
        },
        async (id: string, badCookies: string[]) => {
          return await http()
            .patch(`/task/${id}`)
            .send(dto)
            .set('Cookie', badCookies);
        },
        badCookies,
      );
    });
    it('should throw when no cookies', async () => {
      const task = await createTask(app, cookies, lane.id);
      await expectUnauthorized(() =>
        http().patch(`/task/${task.id}`).send(dto),
      );
    });
    it('should throw when at invalid uuid', async () => {
      await expectBadRequest(() =>
        http().patch('/task/invalid-uuid').send(dto).set('Cookie', cookies),
      );
    });
  });

  describe('DELETE /task:id', () => {
    it('Should receive a valid id', async () => {
      const task = await createTask(app, cookies, lane.id);
      const res = await http()
        .delete(`/task/${task.id}`)
        .set('Cookie', cookies)
        .expect(200);
      const body = res.body as ApiResponse<{ message: string }>;
      expect(body.data).toEqual({
        message: 'Succesfully',
      });
    });
    it('should refuse not owned tasks', async () => {
      await expectForbidden(
        async () => {
          return await createTask(app, cookies, lane.id);
        },
        async (id: string, badCookies: string[]) => {
          return await http().delete(`/task/${id}`).set('Cookie', badCookies);
        },
        badCookies,
      );
    });
    it('should throw when no cookies', async () => {
      const task = await createTask(app, cookies, lane.id);
      await expectUnauthorized(() => http().delete(`/task/${task.id}`));
    });
    it('should throw when at invalid uuid', async () => {
      await expectBadRequest(() =>
        http().delete('/task/invalid-uuid').set('Cookie', cookies),
      );
    });
  });
});
