import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { DataSource, Repository } from 'typeorm';
import { Lane } from 'src/lane/entities/lane.entity';
import { TaskScopedRepository } from './task.scoped.repository';
import { MoveTaskDto } from './dto/move-task.dto';

@Injectable()
export class TaskService {
  constructor(
    private readonly taskRepo: TaskScopedRepository,
    @InjectRepository(Lane)
    private laneRepository: Repository<Lane>,
    private readonly dataSource: DataSource,
  ) {}

  private async validateById(id: string) {
    const task = await this.taskRepo.findOne({ where: { id: id } });
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return task;
  }

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const lane = await this.laneRepository.findOne({
      where: { id: createTaskDto.lane, user: { id: userId } },
    });

    if (!lane) throw new ForbiddenException("Lane doesn't belong to user");

    const lastTask = await this.taskRepo.findOne({
      where: {
        lane: { id: lane.id },
      },
      order: {
        index: 'DESC',
      },
    });

    const index = lastTask ? lastTask.index + 1 : 0;

    const task = await this.taskRepo.save({
      ...createTaskDto,
      index,
      lane: { id: createTaskDto.lane },
    });
    return task;
  }

  findAll() {
    const tasks = this.taskRepo.find();
    return tasks;
  }

  async findOne(id: string) {
    return await this.validateById(id);
  }

  findLaneTasks(id: string) {
    const tasks = this.taskRepo.find({ where: { lane: { id: id } } });
    return tasks;
  }

  moveTask(id: string, moveTaskDto: MoveTaskDto, userId: string) {
    const { targetLane, targetIndex } = moveTaskDto;

    return this.dataSource.transaction(async (manager) => {
      const task = await manager.findOne(Task, {
        where: {
          id,
          user: { id: userId },
        },
        relations: {
          lane: true,
        },
      });

      if (!task) {
        throw new NotFoundException(`Task with ID "${id}" not found`);
      }

      const sourceLaneId = task.lane.id;
      const isSameLane = sourceLaneId === targetLane;

      const destinationLane = await manager.findOne(Lane, {
        where: {
          id: targetLane,
          user: { id: userId },
        },
      });

      if (!destinationLane) {
        throw new ForbiddenException("Target lane doesn't belong to user");
      }

      const oldIndex = task.index;

      if (isSameLane) {
        if (targetIndex === oldIndex) {
          return task;
        }

        console.log('a n');

        if (targetIndex < oldIndex) {
          await manager
            .createQueryBuilder()
            .update(Task)
            .set({
              index: () => '"index" + 1',
            })
            .where('"laneId" = :laneId', {
              laneId: sourceLaneId,
            })
            .andWhere('"index" >= :targetIndex', {
              targetIndex,
            })
            .andWhere('"index" < :oldIndex', {
              oldIndex,
            })
            .andWhere('"id" != :taskId', {
              taskId: id,
            })
            .execute();
        } else {
          await manager
            .createQueryBuilder()
            .update(Task)
            .set({
              index: () => '"index" - 1',
            })
            .where('"laneId" = :laneId', {
              laneId: sourceLaneId,
            })
            .andWhere('"index" > :oldIndex', {
              oldIndex,
            })
            .andWhere('"index" <= :targetIndex', {
              targetIndex,
            })
            .andWhere('"id" != :taskId', {
              taskId: id,
            })
            .execute();
        }

        task.index = targetIndex;

        return manager.save(Task, task);
      }

      await manager
        .createQueryBuilder()
        .update(Task)
        .set({
          index: () => '"index" - 1',
        })
        .where('"laneId" = :laneId', {
          laneId: sourceLaneId,
        })
        .andWhere('"index" > :oldIndex', {
          oldIndex,
        })
        .andWhere('"id" != :taskId', {
          taskId: id,
        })
        .execute();
      const destinationTaskCount = await manager.count(Task, {
        where: {
          lane: { id: targetLane },
        },
      });

      if (targetIndex > destinationTaskCount + 1) {
        throw new BadRequestException(
          `targetIndex cannot be greater than ${destinationTaskCount + 1}`,
        );
      }

      await manager
        .createQueryBuilder()
        .update(Task)
        .set({
          index: () => '"index" + 1',
        })
        .where('"laneId" = :laneId', {
          laneId: targetLane,
        })
        .andWhere('"index" >= :targetIndex', {
          targetIndex,
        })
        .execute();
      task.lane = destinationLane;
      task.index = targetIndex;

      return manager.save(Task, task);
    });
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

    const task = await this.validateById(id);
    Object.assign(task, updateTaskDto);

    return this.taskRepo.save(task);
  }

  async remove(id: string) {
    const task = await this.validateById(id);
    await this.taskRepo.softRemove(task.id);
    return { message: 'Successfully' };
  }
}
