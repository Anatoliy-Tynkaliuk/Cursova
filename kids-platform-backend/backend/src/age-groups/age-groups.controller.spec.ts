import { Test, TestingModule } from '@nestjs/testing';
import { AgeGroupsController } from './age-groups.controller';
import { AgeGroupsService } from './age-groups.service';

describe('AgeGroupsController', () => {
  let controller: AgeGroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgeGroupsController],
      providers: [
        {
          provide: AgeGroupsService,
          useValue: { findAll: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AgeGroupsController>(AgeGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
