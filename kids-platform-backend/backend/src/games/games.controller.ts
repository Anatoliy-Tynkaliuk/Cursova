/**
 * ФАЙЛ: `src/games/games.controller.ts`.
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


import { Controller, Get, Param, Query } from '@nestjs/common';
import { GamesService } from './games.service';

@Controller('games')
// GamesController: клас, що інкапсулює відповідальність цього файлу та координує роботу методів.
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  list(@Query('ageGroupCode') ageGroupCode?: string) {
    return this.gamesService.list(ageGroupCode);
  }

  @Get(':gameId/levels')
  levels(
    @Param('gameId') gameId: string,
    @Query('difficulty') difficulty: string,
    @Query('childProfileId') childProfileId?: string,
  ) {
    return this.gamesService.levels(
      Number(gameId),
      Number(difficulty),
      childProfileId ? Number(childProfileId) : undefined,
    );
  }
}
