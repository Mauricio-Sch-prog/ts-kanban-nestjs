import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ApiResponse } from 'src/common/type/api.response';
import { faker } from '@faker-js/faker';
import { Lane } from 'src/lane/entities/lane.entity';

export const createLane = async (
  app: INestApplication,
  cookies: string[],
  boardId: string,
) => {
  const http = () => request(app.getHttpServer());
  const res = await http()
    .post('/lane')
    .set('Cookie', cookies)
    .send({ name: faker.word.noun(), board: boardId })
    .expect(201);

  const body = res.body as ApiResponse<Lane>;
  expect(body.success).toBe(true);

  return body.data;
};
