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

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Lane)
    private laneRepository: Repository<Lane>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const lane = await this.laneRepository.findOne({
      where: { id: createTaskDto.lane, user: { id: userId } },
    });

    if (!lane) throw new ForbiddenException("Lane doesn't belong to user");

    const task = this.taskRepository.create({
      ...createTaskDto,
      user: { id: userId },
      lane: { id: createTaskDto.lane },
    });
    return await this.taskRepository.save(task);
  }

  findAll(userId: string) {
    const tasks = this.taskRepository.find({ where: { user: { id: userId } } });
    return tasks;
  }

  findOne(id: string) {
    const task = this.taskRepository.findOneBy({ id: id });
    return task;
  }

  findLaneTasks(id: string, userId: string) {
    const tasks = this.taskRepository.findBy({
      lane: { id },
      user: { id: userId },
    });
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

    const task = await this.taskRepository.findOne({
      where: {
        id: id,
        user: { id: userId },
      },
    });

    if (!task) throw new NotFoundException(`Task with ID "${id}" not found`);
    Object.assign(task, updateTaskDto);

    return this.taskRepository.save(task);
  }

  async remove(id: string) {
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    await this.taskRepository.softRemove(task);
    return { message: 'Task removed succesfully' };
  }
}
