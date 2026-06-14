import { Module } from '@nestjs/common';
import { LaneService } from './lane.service';
import { LaneController } from './lane.controller';

@Module({
  controllers: [LaneController],
  providers: [LaneService],
})
export class LaneModule {}
