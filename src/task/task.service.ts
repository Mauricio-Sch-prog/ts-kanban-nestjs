import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { Lane } from 'src/lane/entities/lane.entity';
import { TaskScopedRepository } from './task.scoped.repository';

@Injectable()
export class TaskService {
  constructor(
    private readonly taskRepo: TaskScopedRepository,
    @InjectRepository(Lane)
    private laneRepository: Repository<Lane>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const lane = await this.laneRepository.findOne({
      where: { id: createTaskDto.lane, user: { id: userId } },
    });

    if (!lane) throw new ForbiddenException("Lane doesn't belong to user");

    const task = await this.taskRepo.save({
      ...createTaskDto,
      user: { id: userId },
      lane: { id: createTaskDto.lane },
    });
    return task;
  }

  findAll() {
    const tasks = this.taskRepo.find();
    return tasks;
  }

  findOne(id: string) {
    const task = this.taskRepo.findOne({ where: { id: id } });
    return task;
  }

  findLaneTasks(id: string) {
    const tasks = this.taskRepo.find({ where: { lane: { id: id } } });
    return tasks;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string,
  ): Promise<Task> {
    if (updateTaskDto.lane) {
      const lane = await this.laneRepository.findOne({
        where: { id: updateTaskDto.lane, user: { id: userId } },
      });
      if (!lane) throw new ForbiddenException("Lane doesn't belong to user");
    }

    const task = await this.taskRepo.findOne({ where: { id: id } });

    if (!task) throw new NotFoundException(`Task with ID "${id}" not found`);
    Object.assign(task, updateTaskDto);

    return this.taskRepo.save(task);
  }

  async remove(id: string) {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    await this.taskRepo.softRemove(task);
    return { message: 'Task removed succesfully' };
  }
}
