import { Test, TestingModule } from '@nestjs/testing';
import { AgeGroupsService } from './age-groups.service';

describe('AgeGroupsService', () => {
  let service: AgeGroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgeGroupsService],
    }).compile();

    service = module.get<AgeGroupsService>(AgeGroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
