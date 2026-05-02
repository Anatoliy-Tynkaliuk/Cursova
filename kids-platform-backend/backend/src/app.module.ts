/**
 * Огляд файлу: `kids-platform-backend/backend/src/app.module.ts`.
 * Призначення: містить частину логіки бекенду/фронтенду платформи навчальних ігор.
 * Взаємодія: імпортує типи, сервіси та компоненти з сусідніх модулів і передає дані через DTO/API props.
 * Терміни: API — контракт обміну даними; DTO — тип вхідних/вихідних даних; Service — бізнес-логіка; Controller/Page — точка входу запитів або UI-екран.
 */

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { AgeGroupsModule } from './age-groups/age-groups.module';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AttemptsModule } from './attempts/attempts.module';
import { GamesModule } from './games/games.module';
import { ChildrenModule } from './children/children.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    PrismaModule,
    AgeGroupsModule,
    AttemptsModule,
    GamesModule,
    AuthModule,
    ChildrenModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
