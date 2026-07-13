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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      validate,
    }),
    ...(process.env.NODE_ENV !== 'test'
      ? [
          TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
              type: 'postgres',
              entities: [User, Board, Lane, Task, Tag],
              url: configService.get<string>('DATABASE_URL'),
              autoLoadEntities: true,
              synchronize: process.env.NODE_ENV !== 'production',
            }),
          }),
        ]
      : []),

    ThrottlerModule.forRoot({
      throttlers:
        process.env.NODE_ENV === 'test' ? [] : [{ ttl: 60000, limit: 10 }],
    }),

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
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
