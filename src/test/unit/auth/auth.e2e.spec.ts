import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { appFactory } from 'src/test/factories/app.factory';
import { ApiResponse } from 'src/common/type/api.response';
import { ErrorResponse } from 'src/common/type/error.response';
import { getCookies } from 'src/test/utils/getCookies';
import { loginRequest } from 'src/test/utils/loginRequest';

let cookies: string[];
describe('Auth (e2e)', () => {
  let app: INestApplication;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await appFactory();
    await app.init();

    const res = await loginRequest(app, {});
    cookies = getCookies(res);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('should register and login user', () => {
    it('should register and login', async () => {
      const res = await loginRequest(app, {
        email: 'newUserForKanbanNestJs@gmail.com',
        password: 'passwordIsVeryImportantForAnySecureApp',
      });
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const accessCookie = (cookies as unknown as string[]).find((cookie) =>
        cookie.startsWith('access_token'),
      );
      expect(res.status).toEqual(201);
      expect(accessCookie).toContain('HttpOnly');
      expect(accessCookie).toContain('SameSite=Lax');
    });
    it('should refuse invalid email', async () => {
      const res = await loginRequest(
        app,
        {
          email: 'notAnEmail',
          password: 'doesPasswordStillMatters?',
        },
        'createOnly',
      );
      expect(res.status).toEqual(400);
      expect(res.headers['set-cookie']).not.toBeDefined();
    });

    it('should refuse weak password', async () => {
      const res = await loginRequest(
        app,
        {
          email: 'thisTimeItsAnActualEmail@gmail.com',
          password: 'meek',
        },
        'createOnly',
      );
      expect(res.status).toEqual(400);
      expect(res.headers['set-cookie']).not.toBeDefined();
    });

    it('should refuse wrong password in login', async () => {
      const res = await loginRequest(
        app,
        {
          email: 'newUserForKanbanNestJs@gmail.com',
          password: 'passwordIsVeryImportantForAnySecure',
        },
        'logOnly',
      );
      expect(res.status).toEqual(401);
      expect(res.headers['set-cookie']).not.toBeDefined();
    });

    it('should refuse wrong email in login', async () => {
      const res = await loginRequest(
        app,
        {
          email: 'newUserForKanbanNest2s@gmail.com',
          password: 'passwordIsVeryImportantForAnySecureApp',
        },
        'logOnly',
      );
      expect(res.status).toEqual(401);
      expect(res.headers['set-cookie']).not.toBeDefined();
    });
  });

  describe('should check and return logged user data', () => {
    it('should have a logged user', async () => {
      const res = await http().get('/auth').set('Cookie', cookies).expect(200);
      const body = res.body as ApiResponse;

      expect(body.data).toBeDefined();
    });

    it('should have no logged user', async () => {
      const res = await http().get('/auth').expect(200);
      const body = res.body as ApiResponse;

      expect(body.data).not.toBeDefined();
    });
  });

  describe('Auth should validate cookies', () => {
    it('should have valid cookies', async () => {
      const res = await http().get('/board').set('Cookie', cookies).expect(200);
      const body = res.body as ApiResponse;

      expect(body.data).toEqual([]);
    });

    it('should have invalid cookies', async () => {
      const res = await http().get('/board').expect(401);
      const body = res.body as ErrorResponse;

      expect(body.error).toEqual('UnauthorizedException');
    });

    it('should have malformed token', async () => {
      const malformedCookies = cookies.map((cookie) =>
        cookie.startsWith('access_token')
          ? cookie.replace(/access_token=[^;]+/, 'access_token=invalid_token')
          : cookie,
      );
      const res = await http()
        .get('/board')
        .set('Cookie', malformedCookies)
        .expect(401);
      const body = res.body as ErrorResponse;

      expect(body.error).toEqual('UnauthorizedException');
    });
  });
});
