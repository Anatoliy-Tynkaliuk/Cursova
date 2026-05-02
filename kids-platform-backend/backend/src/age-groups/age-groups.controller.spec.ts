/**
 * Огляд файлу: `kids-platform-backend/backend/src/age-groups/age-groups.controller.spec.ts`.
 * Призначення: містить частину логіки бекенду/фронтенду платформи навчальних ігор.
 * Взаємодія: імпортує типи, сервіси та компоненти з сусідніх модулів і передає дані через DTO/API props.
 * Терміни: API — контракт обміну даними; DTO — тип вхідних/вихідних даних; Service — бізнес-логіка; Controller/Page — точка входу запитів або UI-екран.
 */

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
