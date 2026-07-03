import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CheckOwnership } from 'src/common/decorator/ownershipOptions.decorator';
import { Board } from './entities/board.entity';

@Controller('board')
@UseGuards(AuthGuard)
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  create(@Body() createBoardDto: CreateBoardDto) {
    return this.boardService.create(createBoardDto);
  }

  @Get()
  findAll() {
    return this.boardService.findAll();
  }

  @Get(':id')
  @CheckOwnership({
    entity: Board,
    where: (userId, boardID) => ({
      id: boardID,
      user: { id: userId },
    }),
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.boardService.findOne(id);
  }

  @Patch(':id')
  @CheckOwnership({
    entity: Board,
    where: (userId, boardID) => ({
      id: boardID,
      user: { id: userId },
    }),
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBoardDto: UpdateBoardDto,
  ) {
    return this.boardService.update(id, updateBoardDto);
  }

  @Delete(':id')
  @CheckOwnership({
    entity: Board,
    where: (userId, boardID) => ({
      id: boardID,
      user: { id: userId },
    }),
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.boardService.remove(id);
  }
}
