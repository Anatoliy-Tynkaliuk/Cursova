/**
 * Огляд файлу: `kids-platform-backend/backend/src/prisma/prisma.service.ts`.
 * Призначення: містить частину логіки бекенду/фронтенду платформи навчальних ігор.
 * Взаємодія: імпортує типи, сервіси та компоненти з сусідніх модулів і передає дані через DTO/API props.
 * Терміни: API — контракт обміну даними; DTO — тип вхідних/вихідних даних; Service — бізнес-логіка; Controller/Page — точка входу запитів або UI-екран.
 */

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL!,
      }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
