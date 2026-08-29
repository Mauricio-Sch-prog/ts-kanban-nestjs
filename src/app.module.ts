import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { BoardModule } from './board/board.module';
import { LaneModule } from './lane/lane.module';
import { TaskModule } from './task/task.module';
import { TagsModule } from './tags/tags.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from './config/env.validation';
import { UserModule } from './user/user.module';
import { Board } from './board/entities/board.entity';
import { Task } from './task/entities/task.entity';
import { Lane } from './lane/entities/lane.entity';
import { Tag } from './tags/entities/tag.entity';
import { User } from './user/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { OwnershipGuard } from './common/guard/owrnership.guard';
import { AuthGuard } from './auth/guards/auth.guard';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { MailerModule } from '@nestjs-modules/mailer';
import { RecaptchaModule } from './recaptcha/recaptcha.module';
import { BullModule } from '@nestjs/bullmq';
import { MailModule } from './mail/mail.module';

const isTest = process.env.NODE_ENV === 'test';
const isProduction = process.env.NODE_ENV === 'production';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: isTest ? '.env.test' : '.env',
      validate,
    }),

    MailerModule.forRoot({
      transport: {
        host: 'sandbox.smtp.mailtrap.io',
        port: 587,
        secure: false,
        auth: {
          user: '53872b9bb1a000',
          pass: 'b01af69f4b6766',
        },
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>',
      },
    }),

    ...(!isTest
      ? [
          TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
              return {
                type: 'postgres',
                host: configService.get<string>('DATABASE_HOST', 'localhost'),
                port: configService.get<number>('DATABASE_PORT', 5434),
                username: configService.get<string>('DATABASE_USER'),
                password: configService.get<string>('DATABASE_PASSWORD'),
                database: configService.get<string>('DATABASE_NAME'),
                ssl: isProduction ? { rejectUnauthorized: false } : false,
                entities: [User, Board, Lane, Task, Tag],
                autoLoadEntities: true,
                synchronize: !isProduction,
              };
            },
          }),

          BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
              return {
                connection: isProduction
                  ? { url: configService.get<string>('REDIS_URL') }
                  : {
                      host: configService.get<string>(
                        'REDIS_HOST',
                        'localhost',
                      ),
                      port: configService.get<number>('REDIS_PORT', 6379),
                    },
              };
            },
          }),
        ]
      : []),

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        throttlers: isTest ? [] : [{ ttl: 60000, limit: 100 }],
      }),
    }),

    RecaptchaModule,
    MailModule,
    AuthModule,
    BoardModule,
    LaneModule,
    TaskModule,
    TagsModule,
    UserModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: OwnershipGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    if (process.env.NODE_ENV !== 'test') {
      consumer.apply(LoggerMiddleware).forRoutes('*');
    }
  }
}
