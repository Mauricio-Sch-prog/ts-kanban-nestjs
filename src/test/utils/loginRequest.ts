import { INestApplication } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import request from 'supertest';
import { faker } from '@faker-js/faker';

export const loginRequest = async (
  app: INestApplication,
  overrides: Partial<User> = {},
  mode: 'logOnly' | 'createOnly' | 'both' = 'both',
) => {
  const email = faker.internet.email();
  const password = faker.internet.password();
  const http = () => request(app.getHttpServer());
  if (mode === 'createOnly') {
    return await http()
      .post('/user')
      .send({
        email: overrides.email ?? email,
        password: overrides.password ?? password,
      });
  }

  if (mode === 'logOnly') {
    return await http()
      .post('/auth')
      .send({
        email: overrides.email ?? email,
        password: overrides.password ?? password,
      });
  }

  await http()
    .post('/user')
    .send({
      email: overrides.email ?? email,
      password: overrides.password ?? password,
    });

  return await http()
    .post('/auth')
    .send({
      email: overrides.email ?? email,
      password: overrides.password ?? password,
    });
};
