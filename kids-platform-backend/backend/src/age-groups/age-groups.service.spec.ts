import { Test, TestingModule } from '@nestjs/testing';
import { AgeGroupsService } from './age-groups.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AgeGroupsService', () => {
  let service: AgeGroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgeGroupsService,
        {
          provide: PrismaService,
          useValue: {
            ageGroup: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AgeGroupsService>(AgeGroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
