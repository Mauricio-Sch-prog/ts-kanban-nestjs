import { forwardRef, Module } from '@nestjs/common';
import { LaneService } from './lane.service';
import { LaneController } from './lane.controller';
import { Lane } from './entities/lane.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardModule } from 'src/board/board.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lane]),
    forwardRef(() => BoardModule),
    AuthModule,
  ],
  controllers: [LaneController],
  providers: [LaneService],
})
export class LaneModule {}
