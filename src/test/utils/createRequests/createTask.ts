import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ApiResponse } from 'src/common/type/api.response';
import { faker } from '@faker-js/faker';
import { Task } from 'src/task/entities/task.entity';

export const createTask = async (
  app: INestApplication,
  cookies: string[],
  laneId: string,
) => {
  const http = () => request(app.getHttpServer());
  const res = await http()
    .post('/task')
    .set('Cookie', cookies)
    .send({ title: faker.word.noun(), lane: laneId })
    .expect(201);

  const body = res.body as ApiResponse<Task>;
  expect(body.success).toBe(true);

  return body.data;
};
