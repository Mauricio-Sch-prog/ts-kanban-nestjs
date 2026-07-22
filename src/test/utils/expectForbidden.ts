import { INestApplication } from '@nestjs/common';
import { Response } from 'supertest';
import { loginRequest } from './loginRequest';
import { getCookies } from './getCookies';

interface baseProduct {
  id: string;
}

type createRequestFunc = (
  app: INestApplication,
  cookies: string[],
) => Promise<baseProduct>;

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

  expect(res.status).toEqual(403);
};
