import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from './entities/board.entity';
import { BoardScopedRepository } from './board.scoped.repository';

@Injectable()
export class BoardService {
  constructor(private readonly boardRepo: BoardScopedRepository) {}

  async create(createBoardDto: CreateBoardDto) {
    const newBoard = await this.boardRepo.save({
      ...createBoardDto,
    });
    return newBoard;
  }

  findAll() {
    const boards = this.boardRepo.find();
    return boards;
  }

  findOne(id: string) {
    const board = this.boardRepo.findOne({ where: { id: id } });
    return board;
  }

  async update(id: string, updateBoardDto: UpdateBoardDto): Promise<Board> {
    const board = await this.boardRepo.findOne({ where: { id: id } });
    if (!board) {
      throw new NotFoundException(`Board with ID "${id}" not found`);
    }
    Object.assign(board, updateBoardDto);

    return this.boardRepo.save(board);
  }

  async remove(id: string) {
    const board = await this.boardRepo.findOne({ where: { id } });

    if (!board) {
      throw new NotFoundException(`Board with ID "${id}" not found`);
    }

    await this.boardRepo.softRemove(board);
    return { message: 'Board removed succesfully' };
  }
}
