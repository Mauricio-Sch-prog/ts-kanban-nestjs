import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLaneDto } from './dto/create-lane.dto';
import { UpdateLaneDto } from './dto/update-lane.dto';
import { Lane } from './entities/lane.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from 'src/board/entities/board.entity';
import { LaneScopedRepository } from './lane.scoped.repository';
import { MoveLaneDto } from './dto/move.lane.dto';

@Injectable()
export class LaneService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    private readonly laneRepo: LaneScopedRepository,
    private readonly dataSource: DataSource,
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
      where: {
        id: createLaneDto.board,
        user: { id: userId },
      },
    });

    if (!board) {
      throw new ForbiddenException("Board doesn't belong to user");
    }

    const lastLane = await this.laneRepo.findOne({
      where: {
        board: { id: board.id },
      },
      order: {
        index: 'DESC',
      },
    });

    const index = lastLane ? lastLane.index + 1 : 0;

    const lane = await this.laneRepo.save({
      ...createLaneDto,
      index,
      board: { id: board.id },
      user: { id: userId },
    });

    return this.laneRepo.save(lane);
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

  async moveLane(id: string, moveLaneDto: MoveLaneDto, userId: string) {
    const { targetBoard, targetIndex } = moveLaneDto;

    if (!Number.isInteger(targetIndex) || targetIndex < 0) {
      throw new BadRequestException(
        'targetIndex must be an integer greater than or equal to 1',
      );
    }

    console.log(moveLaneDto);

    return this.dataSource.transaction(async (manager) => {
      const lane = await manager.findOne(Lane, {
        where: {
          id,
          user: { id: userId },
        },
        relations: {
          board: true,
        },
      });

      if (!lane) {
        throw new NotFoundException(`Lane with ID "${id}" not found`);
      }

      const sourceBoardId = lane.board.id;
      const isSameBoard = sourceBoardId === targetBoard;

      const destinationBoard = await manager.findOne(Board, {
        where: {
          id: targetBoard,
          user: { id: userId },
        },
      });

      if (!destinationBoard) {
        throw new ForbiddenException("Target board doesn't belong to user");
      }

      const oldIndex = lane.index;

      if (isSameBoard) {
        if (targetIndex === oldIndex) {
          return lane;
        }

        if (targetIndex < oldIndex) {
          await manager
            .createQueryBuilder()
            .update(Lane)
            .set({
              index: () => '"index" + 1',
            })
            .where('"boardId" = :boardId', {
              boardId: sourceBoardId,
            })
            .andWhere('"index" >= :targetIndex', {
              targetIndex,
            })
            .andWhere('"index" < :oldIndex', {
              oldIndex,
            })
            .andWhere('"id" != :laneId', {
              laneId: id,
            })
            .execute();
        } else {
          await manager
            .createQueryBuilder()
            .update(Lane)
            .set({
              index: () => '"index" - 1',
            })
            .where('"boardId" = :boardId', {
              boardId: sourceBoardId,
            })
            .andWhere('"index" > :oldIndex', {
              oldIndex,
            })
            .andWhere('"index" <= :targetIndex', {
              targetIndex,
            })
            .andWhere('"id" != :laneId', {
              laneId: id,
            })
            .execute();
        }

        lane.index = targetIndex;

        return manager.save(Lane, lane);
      }

      await manager
        .createQueryBuilder()
        .update(Lane)
        .set({
          index: () => '"index" - 1',
        })
        .where('"boardId" = :boardId', {
          boardId: sourceBoardId,
        })
        .andWhere('"index" > :oldIndex', {
          oldIndex,
        })
        .andWhere('"id" != :laneId', {
          laneId: id,
        })
        .execute();
      const destinationLaneCount = await manager.count(Lane, {
        where: {
          board: { id: targetBoard },
        },
      });

      if (targetIndex > destinationLaneCount + 1) {
        throw new BadRequestException(
          `targetIndex cannot be greater than ${destinationLaneCount + 1}`,
        );
      }

      await manager
        .createQueryBuilder()
        .update(Lane)
        .set({
          index: () => '"index" + 1',
        })
        .where('"boardId" = :boardId', {
          boardId: targetBoard,
        })
        .andWhere('"index" >= :targetIndex', {
          targetIndex,
        })
        .execute();
      lane.board = destinationBoard;
      lane.index = targetIndex;

      return manager.save(Lane, lane);
    });
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

    await this.laneRepo.softRemove(lane.id);

    return { message: 'Successfully' };
  }
}
