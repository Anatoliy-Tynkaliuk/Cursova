import { Test, TestingModule } from '@nestjs/testing';
import { AgeGroupsController } from './age-groups.controller';

describe('AgeGroupsController', () => {
  let controller: AgeGroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgeGroupsController],
    }).compile();

    controller = module.get<AgeGroupsController>(AgeGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
