import { Board } from 'src/board/entities/board.entity';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ApiResponse } from 'src/common/type/api.response';
import { faker } from '@faker-js/faker';

export const createBoard = async (app: INestApplication, cookies: string[]) => {
  const http = () => request(app.getHttpServer());
  const res = await http()
    .post('/board')
    .set('Cookie', cookies)
    .send({ name: faker.word.noun() })
    .expect(201);

  const body = res.body as ApiResponse<Board>;
  expect(body.success).toBe(true);

  return body.data;
};
