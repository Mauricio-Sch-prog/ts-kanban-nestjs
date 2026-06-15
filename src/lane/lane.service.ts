import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLaneDto } from './dto/create-lane.dto';
import { UpdateLaneDto } from './dto/update-lane.dto';
import { Lane } from './entities/lane.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LaneService {
  constructor(
    @InjectRepository(Lane)
    private laneRepository: Repository<Lane>,
  ) {}

  async create(createLaneDto: CreateLaneDto) {
    const lane = this.laneRepository.create(createLaneDto);
    return await this.laneRepository.save(lane);
  }

  findAll() {
    const lanes = this.laneRepository.find();
    return lanes;
  }

  findOne(id: string) {
    const lane = this.laneRepository.findOneBy({ id: id });
    return lane;
  }

  findTableLanes(id: string) {
    const lanes = this.laneRepository.findBy({ board: { id: id } });
    return lanes;
  }

  async update(id: string, updateLaneDto: UpdateLaneDto): Promise<Lane> {
    const lane = await this.laneRepository.preload({
      id: id,
      ...updateLaneDto,
    });
    if (!lane) {
      throw new NotFoundException(`Lane with ID "${id}" not found`);
    }
    return this.laneRepository.save(lane);
  }

  async remove(id: string) {
    const lane = await this.laneRepository.findOneBy({ id });
    if (!lane) {
      throw new NotFoundException(`Lane with ID "${id}" not found`);
    }

    await this.laneRepository.softRemove(lane);
  }
}
