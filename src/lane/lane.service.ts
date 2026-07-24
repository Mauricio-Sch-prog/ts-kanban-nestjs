import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLaneDto } from './dto/create-lane.dto';
import { UpdateLaneDto } from './dto/update-lane.dto';
import { Lane } from './entities/lane.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from 'src/board/entities/board.entity';
import { LaneScopedRepository } from './lane.scoped.repository';

@Injectable()
export class LaneService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    private readonly laneRepo: LaneScopedRepository,
  ) {}

  private async validateById(id: string) {
    const lane = await this.laneRepo.findOne({ where: { id: id } });
    if (!lane) {
      throw new NotFoundException(`Lane with ID "${id}" not found`);
    }
    return lane;
  }

  async create(createLaneDto: CreateLaneDto, userId: string) {
    const board = await this.boardRepository.findOne({
      where: { id: createLaneDto.board, user: { id: userId } },
    });

    if (!board) throw new ForbiddenException("Board doesn't belong to user");

    const lane = await this.laneRepo.save({
      ...createLaneDto,
      board: { id: createLaneDto.board },
    });
    return lane;
  }

  findAll() {
    const lanes = this.laneRepo.find();
    return lanes;
  }

  async findOne(id: string) {
    return await this.validateById(id);
  }

  findBoardLanes(id: string) {
    const lanes = this.laneRepo.find({ where: { board: { id: id } } });
    return lanes;
  }

  async update(
    id: string,
    updateLaneDto: UpdateLaneDto,
    userId: string,
  ): Promise<Lane> {
    if (updateLaneDto.board) {
      const board = await this.boardRepository.findOne({
        where: { id: updateLaneDto.board, user: { id: userId } },
      });

      if (!board) throw new ForbiddenException("Board doesn't belong to user");
    }

    const lane = await this.validateById(id);
    Object.assign(lane, updateLaneDto);

    return this.laneRepo.save(lane);
  }

  async remove(id: string) {
    const lane = await this.validateById(id);

    await this.laneRepo.softRemove(lane);

    return { message: 'Succesfully' };
  }
}
