import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ApiResponse } from 'src/common/type/api.response';
import { faker } from '@faker-js/faker';
import { Tag } from 'src/tags/entities/tag.entity';

export const createTag = async (
  app: INestApplication,
  cookies: string[],
  taskId: string,
) => {
  const http = () => request(app.getHttpServer());
  const res = await http()
    .post('/tags')
    .set('Cookie', cookies)
    .send({ name: faker.word.noun(), task: taskId })
    .expect(201);

  const body = res.body as ApiResponse<Tag>;
  expect(body.success).toBe(true);

  return body.data;
};
