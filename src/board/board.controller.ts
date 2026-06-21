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
// import type { AuthenticatedRequest } from 'src/common/interfaces/authenticatedRequest.interface';
import type { AuthenticatedUser } from 'src/common/interfaces/authenticatedUser.interface';

@Controller('board')
@UseGuards(AuthGuard)
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  create(
    @Body() createBoardDto: CreateBoardDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    console.log(user);
    return this.boardService.create(createBoardDto, user.id);
  }

  @Get()
  findAll() {
    return this.boardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.boardService.findOne(id);
  }

  @Get('user/:id/boards')
  findUserBoards(@Param('id', ParseUUIDPipe) id: string) {
    return this.boardService.findUserBoards(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBoardDto: UpdateBoardDto,
  ) {
    return this.boardService.update(id, updateBoardDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.boardService.remove(id);
  }
}
