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

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(createTagDto: CreateTagDto, userId: string) {
    const task = await this.taskRepository.findOne({
      where: { id: createTagDto.task, user: { id: userId } },
    });

    if (!task) throw new ForbiddenException("Board doesn't belong to user");

    const tag = this.tagsRepository.create({
      ...createTagDto,
      user: { id: userId },
      task: { id: createTagDto.task },
    });
    return await this.tagsRepository.save(tag);
  }

  findAll(userId: string) {
    const tags = this.tagsRepository.find({ where: { user: { id: userId } } });
    return tags;
  }

  findOne(id: string) {
    const tag = this.tagsRepository.findOneBy({ id: id });
    return tag;
  }

  findTaskTags(id: string, userId: string) {
    const tag = this.tagsRepository.findBy({
      task: { id },
      user: { id: userId },
    });
    return tag;
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

    const tag = await this.tagsRepository.findOne({
      where: {
        id: id,
        user: { id: userId },
      },
    });
    if (!tag) throw new NotFoundException(`Tag with ID "${id}" not found`);
    Object.assign(tag, updateTagDto);

    return this.tagsRepository.save(tag);
  }

  async remove(id: string) {
    const tag = await this.tagsRepository.findOneBy({ id });
    if (!tag) {
      throw new NotFoundException(`Tag with ID "${id}" not found`);
    }
    await this.tagsRepository.softRemove(tag);
    return { message: 'Tag removed succesfully' };
  }
}
