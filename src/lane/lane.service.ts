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

@Injectable()
export class LaneService {
  constructor(
    @InjectRepository(Lane)
    private laneRepository: Repository<Lane>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async create(createLaneDto: CreateLaneDto, userId: string) {
    const board = await this.boardRepository.findOne({
      where: { id: createLaneDto.board, user: { id: userId } },
    });

    if (!board) throw new ForbiddenException("Board doesn't belong to user");

    const lane = this.laneRepository.create({
      ...createLaneDto,
      user: { id: userId },
      board: { id: createLaneDto.board },
    });
    return await this.laneRepository.save(lane);
  }

  findAll(userId: string) {
    const lanes = this.laneRepository.find({ where: { user: { id: userId } } });
    return lanes;
  }

  findOne(id: string) {
    const lane = this.laneRepository.findOneBy({
      id: id,
    });
    return lane;
  }

  findBoardLanes(id: string, userId: string) {
    const lanes = this.laneRepository.findBy({
      board: { id: id },
      user: { id: userId },
    });
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

    const lane = await this.laneRepository.findOne({
      where: {
        id: id,
        user: { id: userId },
      },
    });
    if (!lane) throw new NotFoundException(`Lane with ID "${id}" not found`);
    Object.assign(lane, updateLaneDto);

    return this.laneRepository.save(lane);
  }

  async remove(id: string) {
    const lane = await this.laneRepository.findOneBy({ id });
    if (!lane) {
      throw new NotFoundException(`Lane with ID "${id}" not found`);
    }
    await this.laneRepository.softRemove(lane);
    return { message: 'Lane removed succesfully' };
  }
}
