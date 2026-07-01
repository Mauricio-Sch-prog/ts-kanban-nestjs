import { forwardRef, Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { TaskModule } from 'src/task/task.module';
import { AuthModule } from 'src/auth/auth.module';
import { Task } from 'src/task/entities/task.entity';
import { TagsScopedRepository } from './tags.scoped.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tag, Task]),
    forwardRef(() => TaskModule),
    AuthModule,
  ],
  controllers: [TagsController],
  providers: [TagsService, TagsScopedRepository],
})
export class TagsModule {}
