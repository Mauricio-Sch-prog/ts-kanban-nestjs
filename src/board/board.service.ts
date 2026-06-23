import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from './entities/board.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async create(createBoardDto: CreateBoardDto, userId: string) {
    const newBoard = this.boardRepository.create({
      ...createBoardDto,
      user: { id: userId },
    });
    return await this.boardRepository.save(newBoard);
  }

  findAll() {
    const boards = this.boardRepository.find();
    return boards;
  }

  findOne(id: string) {
    const board = this.boardRepository.findOneBy({ id: id });
    return board;
  }

  findUserBoards(id: string) {
    const boards = this.boardRepository.findBy({ id: id });
    return boards;
  }

  async update(id: string, updateBoardDto: UpdateBoardDto): Promise<Board> {
    const board = await this.boardRepository.preload({
      id: id,
      ...updateBoardDto,
    });
    if (!board) {
      throw new NotFoundException(`Board with ID "${id}" not found`);
    }
    return this.boardRepository.save(board);
  }

  async remove(id: string) {
    const board = await this.boardRepository.findOneBy({ id });

    if (!board) {
      throw new NotFoundException(`Board with ID "${id}" not found`);
    }

    await this.boardRepository.softRemove(board);
  }
}
