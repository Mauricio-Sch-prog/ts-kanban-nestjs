import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const task = this.taskRepository.create({
      ...createTaskDto,
      user: { id: userId },
      lane: { id: createTaskDto.lane },
    });
    return await this.taskRepository.save(task);
  }

  findAll() {
    const tasks = this.taskRepository.find();
    return tasks;
  }

  findOne(id: string) {
    const task = this.taskRepository.findOneBy({ id: id });
    return task;
  }

  findLaneTasks(id: string) {
    const tasks = this.taskRepository.findBy({ lane: { id } });
    return tasks;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepository.preload({
      id: id,
      ...updateTaskDto,
      lane: { id: updateTaskDto.lane },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return this.taskRepository.save(task);
  }

  async remove(id: string) {
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    await this.taskRepository.softRemove(task);
  }
}
