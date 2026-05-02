/**
 * Огляд файлу: `kids-platform-backend/backend/src/age-groups/age-groups.module.ts`.
 * Призначення: містить частину логіки бекенду/фронтенду платформи навчальних ігор.
 * Взаємодія: імпортує типи, сервіси та компоненти з сусідніх модулів і передає дані через DTO/API props.
 * Терміни: API — контракт обміну даними; DTO — тип вхідних/вихідних даних; Service — бізнес-логіка; Controller/Page — точка входу запитів або UI-екран.
 */

import { Module } from '@nestjs/common';
import { AgeGroupsController } from './age-groups.controller';
import { AgeGroupsService } from './age-groups.service';

@Module({
  controllers: [AgeGroupsController],
  providers: [AgeGroupsService],
})
export class AgeGroupsModule {}
