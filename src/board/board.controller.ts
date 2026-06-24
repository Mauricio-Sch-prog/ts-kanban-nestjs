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
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import type { AuthenticatedUser } from 'src/common/interfaces/authenticatedUser.interface';
import { CheckOwnership } from 'src/common/decorators/ownershipOptions.decorator';
import { Board } from './entities/board.entity';

@Controller('board')
@UseGuards(AuthGuard)
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  create(
    @Body() createBoardDto: CreateBoardDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.boardService.create(createBoardDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.boardService.findAll(user.id);
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
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.boardService.update(id, updateBoardDto, user.id);
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
