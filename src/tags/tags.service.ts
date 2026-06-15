import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
  ) {}

  async create(createTagDto: CreateTagDto) {
    const tag = this.tagsRepository.create(createTagDto);
    return await this.tagsRepository.save(tag);
  }

  findAll() {
    const tags = this.tagsRepository.find();
    return tags;
  }

  findOne(id: string) {
    const tag = this.tagsRepository.findOneBy({ id: id });
    return tag;
  }

  findTaskTags(id: string) {
    const tag = this.tagsRepository.findBy({ task: { id } });
    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.tagsRepository.preload({
      id: id,
      ...updateTagDto,
    });
    if (!tag) {
      throw new NotFoundException(`Tag with ID "${id}" not found`);
    }
    return this.tagsRepository.save(tag);
  }

  async remove(id: string) {
    const tag = await this.tagsRepository.findOneBy({ id });
    if (!tag) {
      throw new NotFoundException(`Tag with ID "${id}" not found`);
    }
    await this.tagsRepository.softRemove(tag);
  }
}
