import { Response } from 'supertest';

export const getCookies = (res: Response): string[] => {
  const cookies = res.headers['set-cookie'];

  if (!Array.isArray(cookies)) {
    return [];
  }

  return cookies;
};
