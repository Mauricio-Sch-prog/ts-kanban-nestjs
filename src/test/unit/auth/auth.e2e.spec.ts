import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';

import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          url: process.env.TEST_DATABASE_URL,
          autoLoadEntities: true,
          synchronize: true,
          dropSchema: true,
        }),
      ],
    }).compile();

    dataSource = moduleFixture.get(DataSource);
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('should register and login user', () => {
    it('should register and login', async () => {
      await http()
        .post('/user')
        .send({
          email: 'test@test.com',
          password: '123456',
        })
        .expect(201);

      const res = await http()
        .post('/auth')
        .send({
          email: 'test@test.com',
          password: '123456',
        })
        .expect(201);

      expect(res.headers['set-cookie']).toEqual(
        expect.arrayContaining([expect.stringContaining('access_token')]),
      );
    });
  });
});
