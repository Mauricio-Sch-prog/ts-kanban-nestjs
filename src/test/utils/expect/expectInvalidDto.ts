import { INestApplication } from '@nestjs/common';
import { ErrorResponse } from 'src/common/type/error.response';
import request, { Response } from 'supertest';

export const expectInvalidDto = async (
  app: INestApplication,
  route: string,
  cookies: string[],
) => {
  const http = () => request(app.getHttpServer());
  const res = await http()
    .post(route)
    .set('Cookie', cookies)
    .send()
    .expect(400);
  const body = res.body as ErrorResponse;

  expect(res.status).toBe(400);
  expect(body.success).toEqual(false);
  expect(body.error).toBe('BadRequestException');
};
