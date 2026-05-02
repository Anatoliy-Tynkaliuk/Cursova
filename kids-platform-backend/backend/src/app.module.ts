/**
 * ФАЙЛ: `src/app.module.ts`.
 * ЗАГАЛОМ: цей файл є частиною backend-сервера на NestJS і реалізує окремий модуль/шар архітектури.
 * ВЗАЄМОДІЯ: файл імпортує сутності з інших модулів (DTO, Service, Guard, Prisma), а результати експортує через класи/функції.
 * ПОТІК ДАНИХ: запит -> Controller -> Service -> Prisma/БД -> відповідь клієнту.
 * ПОНЯТТЯ:
 * - NestJS: фреймворк для серверних застосунків на Node.js із модульною архітектурою.
 * - Controller: приймає HTTP-запити і передає їх у сервіс.
 * - Service: містить бізнес-логіку, валідацію, обчислення.
 * - DTO (Data Transfer Object): контракт форми даних для входу/виходу.
 * - Guard: перевіряє доступ до маршруту (автентифікація/ролі).
 * - Prisma: ORM для читання/запису даних у БД через типізований API.
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
// AppModule: клас, що інкапсулює відповідальність цього файлу та координує роботу методів.
export class AppModule {}
