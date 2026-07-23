import { INestApplication } from '@nestjs/common';
import { Response } from 'supertest';
import { ErrorResponse } from 'src/common/type/error.response';

interface BaseEntityWithId {
  id: string;
}

type createRequestFunc = (
  app: INestApplication,
  cookies: string[],
) => Promise<BaseEntityWithId>;

type forbiddenRequestFunc = (
  id: string,
  badCookies: string[],
) => Promise<Response>;

export const expectForbidden = async (
  app: INestApplication,
  createRequest: createRequestFunc,
  forbiddenRequest: forbiddenRequestFunc,
  cookies: string[],
  badCookies: string[],
) => {
  const product = await createRequest(app, cookies);

  const id = product.id;

  const res = await forbiddenRequest(id, badCookies);

  const body = res.body as ErrorResponse;

  expect(res.status).toBe(403);
  expect(body.success).toBe(false);
  expect(body.error).toBe('ForbiddenException');
};
