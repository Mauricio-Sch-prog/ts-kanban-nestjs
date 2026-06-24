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

  findAll(userId: string) {
    const boards = this.boardRepository.find({
      where: { user: { id: userId } },
    });
    return boards;
  }

  findOne(id: string) {
    const board = this.boardRepository.findOneBy({ id: id });
    return board;
  }

  async update(
    id: string,
    updateBoardDto: UpdateBoardDto,
    userId: string,
  ): Promise<Board> {
    const board = await this.boardRepository.findOne({
      where: { id: id, user: { id: userId } },
    });
    if (!board) {
      throw new NotFoundException(`Board with ID "${id}" not found`);
    }
    Object.assign(board, updateBoardDto);

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
