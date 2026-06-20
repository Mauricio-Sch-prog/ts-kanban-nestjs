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
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('lane')
@UseGuards(AuthGuard)
export class LaneController {
  constructor(private readonly laneService: LaneService) {}

  @Post()
  create(@Body() createLaneDto: CreateLaneDto) {
    return this.laneService.create(createLaneDto);
  }

  @Get()
  findAll() {
    return this.laneService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.laneService.findOne(id);
  }

  @Get('boards/:boardId/lanes')
  findTableLanes(@Param('boardId', ParseUUIDPipe) id: string) {
    return this.laneService.findTableLanes(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLaneDto: UpdateLaneDto,
  ) {
    return this.laneService.update(id, updateLaneDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.laneService.remove(id);
  }
}
