import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from './entities/board.entity';
import { BoardScopedRepository } from './board.scoped.repository';
import { BoardPaginationDto } from './dto/board-paginating.dto';

@Injectable()
export class BoardService {
  constructor(private readonly boardRepo: BoardScopedRepository) {}

  private async validateById(id: string) {
    const board = await this.boardRepo.findOne({ where: { id: id } });
    if (!board) {
      throw new NotFoundException(`Board with ID "${id}" not found`);
    }
    return board;
  }

  async create(createBoardDto: CreateBoardDto) {
    const newBoard = await this.boardRepo.save({
      ...createBoardDto,
    });
    return newBoard;
  }

  async findAll(paginationDto: BoardPaginationDto) {
    const { page, limit } = paginationDto;

    const [data, total] = await this.boardRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return await this.validateById(id);
  }

  async findDetails(id: string) {
    return await this.boardRepo.findOne({
      where: { id },
      relations: {
        lanes: {
          tasks: true,
        },
      },
      order: {
        lanes: {
          index: 'ASC',
          tasks: {
            index: 'ASC',
          },
        },
      },
    });
  }

  async update(id: string, updateBoardDto: UpdateBoardDto): Promise<Board> {
    const board = await this.validateById(id);
    Object.assign(board, updateBoardDto);

    return this.boardRepo.save(board);
  }

  async remove(id: string) {
    const board = await this.validateById(id);

    await this.boardRepo.softRemove(board.id);
    return { message: 'Successfully' };
  }
}
