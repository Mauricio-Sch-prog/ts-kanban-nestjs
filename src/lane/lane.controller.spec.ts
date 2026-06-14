import { Test, TestingModule } from '@nestjs/testing';
import { LaneController } from './lane.controller';
import { LaneService } from './lane.service';

describe('LaneController', () => {
  let controller: LaneController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LaneController],
      providers: [LaneService],
    }).compile();

    controller = module.get<LaneController>(LaneController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
