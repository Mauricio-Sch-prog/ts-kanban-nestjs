import { ErrorResponse } from 'src/common/type/error.response';
import { Response } from 'supertest';

type reqFunc = () => Promise<Response>;

export const expectBadRequest = async (req: reqFunc) => {
  const res = await req();

  const body = res.body as ErrorResponse;

  expect(res.status).toBe(400);
  expect(body.success).toEqual(false);
  expect(body.error).toBe('BadRequestException');
};
