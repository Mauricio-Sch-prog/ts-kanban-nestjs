import { INestApplication } from '@nestjs/common';
import { Response } from 'supertest';
import { loginRequest } from '../loginRequest';
import { getCookies } from '../getCookies';
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
) => {
  const user1 = await loginRequest(app);
  const cookies1 = getCookies(user1);

  const user2 = await loginRequest(app);
  const cookies2 = getCookies(user2);

  const product = await createRequest(app, cookies1);

  const id = product.id;

  const res = await forbiddenRequest(id, cookies2);

  const body = res.body as ErrorResponse;

  expect(res.status).toBe(403);
  expect(body.success).toBe(false);
  expect(body.error).toBe('ForbiddenException');
};
