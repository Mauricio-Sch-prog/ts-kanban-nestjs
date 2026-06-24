import { forwardRef, Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { LaneModule } from 'src/lane/lane.module';
import { AuthModule } from 'src/auth/auth.module';
import { Lane } from 'src/lane/entities/lane.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Lane]),
    forwardRef(() => LaneModule),
    AuthModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
