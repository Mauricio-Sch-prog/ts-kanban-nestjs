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
import { Tag } from 'src/tags/entities/tag.entity';
import { createTag } from 'src/test/utils/createRequests/createTag';

let board: Board;
let lane: Lane;
let task: Task;
let cookies: string[];
let badCookies: string[];
describe('Tags (e2e)', () => {
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
    task = await createTask(app, cookies, lane.id);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /tags', () => {
    it('should send dto and successfully create tag', async () => {
      const res = await http()
        .post('/tags')
        .set('Cookie', cookies)
        .send({
          name: 'this tag tells something about something',
          task: task.id,
        })
        .expect(201);

      const body = res.body as ApiResponse<Tag>;

      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({
        name: 'this tag tells something about something',
        task: { id: task.id },
      });
    });
  });

  it('should refuse invalid dto', async () => {
    await expectInvalidDto(app, '/tags', cookies);
  });

  it('should throw when no cookies', async () => {
    await expectUnauthorized(() =>
      http().post('/tags').send({
        name: 'some tag to be attached',
        task: task.id,
      }),
    );
  });

  it('should refuse not owned tasks', async () => {
    await expectForbidden(
      async () => {
        return createTask(app, cookies, lane.id);
      },
      async (id: string, badCookies: string[]) => {
        return await http()
          .post(`/tags`)
          .send({
            name: 'a very unallowed tag',
            task: id,
          })
          .set('Cookie', badCookies);
      },
      badCookies,
    );
  });

  describe('GET /task', () => {
    it('Should succeed', async () => {
      const res = await http().get('/tags').set('Cookie', cookies).expect(200);
      const body = res.body as ApiResponse<Tag[]>;
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });
    it('should throw when no cookies', async () => {
      await expectUnauthorized(() => http().get('/tags'));
    });
  });
  describe('GET /tags:id', () => {
    it('Should receive a valid id', async () => {
      const tag = await createTag(app, cookies, task.id);
      const res = await http()
        .get(`/tags/${tag.id}`)
        .set('Cookie', cookies)
        .expect(200);
      const body = res.body as ApiResponse<Tag>;
      expect(body.success).toBe(true);
    });
    it('should refuse not owned tags', async () => {
      await expectForbidden(
        async () => {
          return await createTag(app, cookies, task.id);
        },
        async (id: string, badCookies: string[]) => {
          return await http().get(`/tags/${id}`).set('Cookie', badCookies);
        },
        badCookies,
      );
    });
    it('should throw when no cookies', async () => {
      const tag = await createTag(app, cookies, task.id);
      await expectUnauthorized(() => http().get(`/tags/${tag.id}`));
    });
    it('should throw when at invalid uuid', async () => {
      await expectBadRequest(() =>
        http().get('/tags/invalid-uuid').set('Cookie', cookies),
      );
    });
  });

  describe('GET /tags/task:id/tags', () => {
    it('Should receive a valid id', async () => {
      await createTag(app, cookies, task.id);
      const res = await http()
        .get(`/tags/task/${task.id}/tags`)
        .set('Cookie', cookies)
        .expect(200);
      const body = res.body as ApiResponse<Tag[]>;
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });
    it('should refuse not owned tasks', async () => {
      await expectForbidden(
        async () => {
          return await createTask(app, cookies, lane.id);
        },
        async (id: string, badCookies: string[]) => {
          return await http()
            .get(`/tags/task/${id}/tags`)
            .set('Cookie', badCookies);
        },
        badCookies,
      );
    });
    it('should throw when no cookies', async () => {
      await expectUnauthorized(() => http().get(`/tags/task/${task.id}/tags`));
    });
    it('should throw when at invalid uuid', async () => {
      await expectBadRequest(() =>
        http().get('/tags/task/invalid-uuid/tags').set('Cookie', cookies),
      );
    });
  });

  describe('PATCH /tags:id', () => {
    const dto = { name: 'changed tag' };
    it('Should receive a valid id and valid dto', async () => {
      const tag = await createTag(app, cookies, task.id);
      const res = await http()
        .patch(`/tags/${tag.id}`)
        .send(dto)
        .set('Cookie', cookies)
        .expect(200);
      const body = res.body as ApiResponse<Tag>;
      expect(body.success).toBe(true);
      expect(body.data.name).toBe(dto.name);
    });
    it('Should refuse invalid dto', async () => {
      const tag = await createTag(app, cookies, task.id);
      const res = await http()
        .patch(`/tags/${tag.id}`)
        .send({ name: '' })
        .set('Cookie', cookies)
        .expect(400);
      const body = res.body as ErrorResponse;
      expect(body.success).toBe(false);
      expect(body.error).toBe('BadRequestException');
    });
    it('should refuse not owned tasks', async () => {
      await expectForbidden(
        async () => {
          return await createTag(app, cookies, task.id);
        },
        async (id: string, badCookies: string[]) => {
          return await http()
            .patch(`/tags/${id}`)
            .send(dto)
            .set('Cookie', badCookies);
        },
        badCookies,
      );
    });
    it('should throw when no cookies', async () => {
      const tag = await createTag(app, cookies, task.id);
      await expectUnauthorized(() => http().patch(`/tags/${tag.id}`).send(dto));
    });
    it('should throw when at invalid uuid', async () => {
      await expectBadRequest(() =>
        http().patch('/tags/invalid-uuid').send(dto).set('Cookie', cookies),
      );
    });
  });

  describe('DELETE /tags:id', () => {
    it('Should receive a valid id', async () => {
      const tag = await createTag(app, cookies, task.id);
      const res = await http()
        .delete(`/tags/${tag.id}`)
        .set('Cookie', cookies)
        .expect(200);
      const body = res.body as ApiResponse<{ message: string }>;
      expect(body.data).toEqual({
        message: 'Successfully',
      });
    });
    it('should refuse not owned tags', async () => {
      await expectForbidden(
        async () => {
          return await createTag(app, cookies, task.id);
        },
        async (id: string, badCookies: string[]) => {
          return await http().delete(`/tags/${id}`).set('Cookie', badCookies);
        },
        badCookies,
      );
    });
    it('should throw when no cookies', async () => {
      const tag = await createTag(app, cookies, task.id);
      await expectUnauthorized(() => http().delete(`/tags/${tag.id}`));
    });
    it('should throw when at invalid uuid', async () => {
      await expectBadRequest(() =>
        http().delete('/tags/invalid-uuid').set('Cookie', cookies),
      );
    });
  });
});
