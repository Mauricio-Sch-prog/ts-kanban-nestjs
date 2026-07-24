import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from './entities/board.entity';
import { BoardScopedRepository } from './board.scoped.repository';

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

  findAll() {
    const boards = this.boardRepo.find();
    return boards;
  }

  async findOne(id: string) {
    return await this.validateById(id);
  }

  async update(id: string, updateBoardDto: UpdateBoardDto): Promise<Board> {
    const board = await this.validateById(id);
    Object.assign(board, updateBoardDto);

    return this.boardRepo.save(board);
  }

  async remove(id: string) {
    const board = await this.validateById(id);

    await this.boardRepo.softRemove(board);
    return { message: 'Succesfully' };
  }
}
