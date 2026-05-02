/**
 * Огляд файлу: `kids-platform-backend/backend/src/children/children.module.ts`.
 * Призначення: містить частину логіки бекенду/фронтенду платформи навчальних ігор.
 * Взаємодія: імпортує типи, сервіси та компоненти з сусідніх модулів і передає дані через DTO/API props.
 * Терміни: API — контракт обміну даними; DTO — тип вхідних/вихідних даних; Service — бізнес-логіка; Controller/Page — точка входу запитів або UI-екран.
 */

import { Module } from '@nestjs/common';
import { ChildrenController } from './children.controller';
import { ChildPublicController } from './child-public.controller';
import { ChildrenService } from './children.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ChildrenController, ChildPublicController],
  providers: [ChildrenService],
})
export class ChildrenModule {}
