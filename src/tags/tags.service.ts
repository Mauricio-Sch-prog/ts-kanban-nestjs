import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Task } from 'src/task/entities/task.entity';
import { TagsScopedRepository } from './tags.scoped.repository';

@Injectable()
export class TagsService {
  constructor(
    private readonly tagsRepo: TagsScopedRepository,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(createTagDto: CreateTagDto, userId: string) {
    const task = await this.taskRepository.findOne({
      where: { id: createTagDto.task, user: { id: userId } },
    });

    if (!task) throw new ForbiddenException("Task doesn't belong to user");

    const tag = await this.tagsRepo.save({
      ...createTagDto,
      task: { id: createTagDto.task },
    });
    return tag;
  }

  findAll() {
    const tags = this.tagsRepo.find();
    return tags;
  }

  findOne(id: string) {
    const tag = this.tagsRepo.findOne({ where: { id: id } });
    return tag;
  }

  findTaskTags(id: string) {
    const tags = this.tagsRepo.find({ where: { task: { id: id } } });
    return tags;
  }

  async update(
    id: string,
    updateTagDto: UpdateTagDto,
    userId: string,
  ): Promise<Tag> {
    if (updateTagDto.task) {
      const task = await this.taskRepository.findOne({
        where: { id: updateTagDto.task, user: { id: userId } },
      });

      if (!task) throw new ForbiddenException("Task doesn't belong to user");
    }

    const tag = await this.tagsRepo.findOne({ where: { id: id } });
    if (!tag) throw new NotFoundException(`Tag with ID "${id}" not found`);
    Object.assign(tag, updateTagDto);

    return await this.tagsRepo.save(tag);
  }

  async remove(id: string) {
    const tag = await this.tagsRepo.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException(`Tag with ID "${id}" not found`);
    }
    await this.tagsRepo.softRemove(tag);
    return { message: 'Tag removed succesfully' };
  }
}
