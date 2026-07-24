import { Response } from 'supertest';
import { ErrorResponse } from 'src/common/type/error.response';

interface BaseEntityWithId {
  id: string;
}

type createRequestFunc = () => Promise<BaseEntityWithId>;

type forbiddenRequestFunc = (
  id: string,
  badCookies: string[],
) => Promise<Response>;

export const expectForbidden = async (
  createRequest: createRequestFunc,
  forbiddenRequest: forbiddenRequestFunc,
  badCookies: string[],
) => {
  const product = await createRequest();

  const id = product.id;

  const res = await forbiddenRequest(id, badCookies);

  const body = res.body as ErrorResponse;

  expect(res.status).toBe(403);
  expect(body.success).toBe(false);
  expect(body.error).toBe('ForbiddenException');
};
