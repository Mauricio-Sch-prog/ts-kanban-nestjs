import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import type { AuthenticatedUser } from 'src/common/type/authenticatedUser.interface';
import { CheckOwnership } from 'src/common/decorator/ownershipOptions.decorator';
import { Task } from './entities/task.entity';
import { Lane } from 'src/lane/entities/lane.entity';

@Controller('task')
@UseGuards(AuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.taskService.create(createTaskDto, user.id);
  }

  @Get()
  findAll() {
    return this.taskService.findAll();
  }

  @Get(':id')
  @CheckOwnership({
    entity: Task,
    where: (userId, taskId) => ({
      id: taskId,
      user: { id: userId },
    }),
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.taskService.findOne(id);
  }

  @Get('lane/:laneId/tasks')
  @CheckOwnership({
    entity: Lane,
    param: 'laneId',
    where: (userId, laneId) => ({
      id: laneId,
      user: { id: userId },
    }),
  })
  findLaneTasks(@Param('laneId', ParseUUIDPipe) id: string) {
    return this.taskService.findLaneTasks(id);
  }

  @Patch(':id')
  @CheckOwnership({
    entity: Task,
    where: (userId, taskId) => ({
      id: taskId,
      user: { id: userId },
    }),
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.taskService.update(id, updateTaskDto, user.id);
  }

  @Delete(':id')
  @CheckOwnership({
    entity: Task,
    where: (userId, taskId) => ({
      id: taskId,
      user: { id: userId },
    }),
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.taskService.remove(id);
  }
}
