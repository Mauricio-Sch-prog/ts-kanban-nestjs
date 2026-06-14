import { forwardRef, Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { LaneModule } from 'src/lane/lane.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), forwardRef(() => LaneModule)],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
