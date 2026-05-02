/**
 * Огляд файлу: `kids-platform-backend/backend/src/age-groups/age-groups.service.spec.ts`.
 * Призначення: містить частину логіки бекенду/фронтенду платформи навчальних ігор.
 * Взаємодія: імпортує типи, сервіси та компоненти з сусідніх модулів і передає дані через DTO/API props.
 * Терміни: API — контракт обміну даними; DTO — тип вхідних/вихідних даних; Service — бізнес-логіка; Controller/Page — точка входу запитів або UI-екран.
 */

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
