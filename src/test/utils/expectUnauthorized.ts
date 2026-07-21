import { ErrorResponse } from 'src/common/type/error.response';
import { Response } from 'supertest';

type reqFunc = () => Promise<Response>;

export const expectUnauthorized = async (req: reqFunc) => {
  const res = await req();

  const body = res.body as ErrorResponse;
  expect(res.status).toBe(401);
  expect(body.success).toEqual(false);
  expect(body.error).toBe('UnauthorizedException');
};
