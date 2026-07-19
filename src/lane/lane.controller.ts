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
import { LaneService } from './lane.service';
import { CreateLaneDto } from './dto/create-lane.dto';
import { UpdateLaneDto } from './dto/update-lane.dto';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import type { AuthenticatedUser } from 'src/common/type/authenticatedUser.interface';
import { CheckOwnership } from 'src/common/decorator/ownershipOptions.decorator';
import { Lane } from './entities/lane.entity';
import { Board } from 'src/board/entities/board.entity';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('lane')
@UseGuards(AuthGuard)
export class LaneController {
  constructor(private readonly laneService: LaneService) {}

  @Post()
  create(
    @Body() createLaneDto: CreateLaneDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.laneService.create(createLaneDto, user.id);
  }

  @Get()
  findAll() {
    return this.laneService.findAll();
  }

  @Get(':id')
  @CheckOwnership({
    entity: Lane,
    where: (userId, laneId) => ({
      id: laneId,
      user: { id: userId },
    }),
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.laneService.findOne(id);
  }

  @Get('board/:boardId/lanes')
  @CheckOwnership({
    entity: Board,
    param: 'boardId',
    where: (userId, boardId) => ({
      id: boardId,
      user: { id: userId },
    }),
  })
  findBoardLanes(@Param('boardId', ParseUUIDPipe) id: string) {
    return this.laneService.findBoardLanes(id);
  }

  @Patch(':id')
  @CheckOwnership({
    entity: Lane,
    where: (userId, laneId) => ({
      id: laneId,
      user: { id: userId },
    }),
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLaneDto: UpdateLaneDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.laneService.update(id, updateLaneDto, user.id);
  }

  @Delete(':id')
  @CheckOwnership({
    entity: Lane,
    where: (userId, laneId) => ({
      id: laneId,
      user: { id: userId },
    }),
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.laneService.remove(id);
  }
}
