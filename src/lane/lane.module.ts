import { forwardRef, Module } from '@nestjs/common';
import { LaneService } from './lane.service';
import { LaneController } from './lane.controller';
import { Lane } from './entities/lane.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardModule } from 'src/board/board.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lane]), forwardRef(() => BoardModule)],
  controllers: [LaneController],
  providers: [LaneService],
})
export class LaneModule {}
