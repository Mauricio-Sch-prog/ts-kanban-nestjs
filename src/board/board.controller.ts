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
  Query,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CheckOwnership } from 'src/common/decorator/ownershipOptions.decorator';
import { Board } from './entities/board.entity';
import { BoardPaginationDto } from './dto/board-paginating.dto';

@Controller('board')
@UseGuards(AuthGuard)
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  create(@Body() createBoardDto: CreateBoardDto) {
    return this.boardService.create(createBoardDto);
  }

  @Get()
  findAll(@Query() boardPaginationDto: BoardPaginationDto) {
    return this.boardService.findAll(boardPaginationDto);
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

  @Get(':id/details')
  @CheckOwnership({
    entity: Board,
    where: (userId, boardID) => ({
      id: boardID,
      user: { id: userId },
    }),
  })
  findDetails(@Param('id', ParseUUIDPipe) id: string) {
    return this.boardService.findDetails(id);
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
