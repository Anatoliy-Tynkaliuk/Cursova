/**
 * Огляд файлу: `kids-platform-backend/backend/src/age-groups/age-groups.controller.ts`.
 * Призначення: містить частину логіки бекенду/фронтенду платформи навчальних ігор.
 * Взаємодія: імпортує типи, сервіси та компоненти з сусідніх модулів і передає дані через DTO/API props.
 * Терміни: API — контракт обміну даними; DTO — тип вхідних/вихідних даних; Service — бізнес-логіка; Controller/Page — точка входу запитів або UI-екран.
 */

import { Controller, Get } from '@nestjs/common';
import { AgeGroupsService } from './age-groups.service';

@Controller('age-groups')
export class AgeGroupsController {
  constructor(private readonly service: AgeGroupsService) {}

  @Get()
  async getAll() {
    return this.service.findAll();
  }
}
