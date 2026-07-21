import { ErrorResponse } from 'src/common/type/error.response';
import { Response } from 'supertest';

type reqFunc = () => Promise<Response>;

export const testCookies = (route: string, req: reqFunc) => {
  it(`should throw when there are no cookies in ${route}`, async () => {
    const res = await req();

    const body = res.body as ErrorResponse;
    expect(res.status).toBe(401);
    expect(body.success).toEqual(false);
  });
};
