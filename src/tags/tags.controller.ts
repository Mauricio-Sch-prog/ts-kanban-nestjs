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
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import type { AuthenticatedUser } from 'src/common/interface/authenticatedUser.interface';
import { CheckOwnership } from 'src/common/decorator/ownershipOptions.decorator';
import { Tag } from './entities/tag.entity';
import { Task } from 'src/task/entities/task.entity';

@Controller('tags')
@UseGuards(AuthGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  create(
    @Body() createTagDto: CreateTagDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tagsService.create(createTagDto, user.id);
  }

  @Get()
  findAll() {
    return this.tagsService.findAll();
  }

  @Get(':id')
  @CheckOwnership({
    entity: Tag,
    where: (userId, tagId) => ({
      id: tagId,
      user: { id: userId },
    }),
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tagsService.findOne(id);
  }

  @Get('task/:taskId/tags')
  @CheckOwnership({
    entity: Task,
    param: 'taskId',
    where: (userId, taskId) => ({
      id: taskId,
      user: { id: userId },
    }),
  })
  findTaskTags(@Param('taskId', ParseUUIDPipe) id: string) {
    return this.tagsService.findTaskTags(id);
  }

  @Patch(':id')
  @CheckOwnership({
    entity: Tag,
    where: (userId, tagId) => ({
      id: tagId,
      user: { id: userId },
    }),
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTagDto: UpdateTagDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tagsService.update(id, updateTagDto, user.id);
  }

  @Delete(':id')
  @CheckOwnership({
    entity: Tag,
    where: (userId, tagId) => ({
      id: tagId,
      user: { id: userId },
    }),
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tagsService.remove(id);
  }
}
