/**
 * 📘 ОГЛЯД ФАЙЛУ: `kids-platform-backend/backend/src/games/games.controller.ts`.
 * ЩО ЦЕ: цей файл — частина навчальної платформи для дітей (бекенд API або фронтенд-екран).
 * НАВІЩО: реалізує конкретний шмат логіки (дані, перевірки, маршрути, або відображення інтерфейсу).
 * ЯК ПРАЦЮЄ: імпортує залежності, приймає вхідні дані, обробляє їх, та повертає результат/HTML/API-відповідь.
 * ВЗАЄМОДІЯ З ІНШИМИ ФАЙЛАМИ: через import/export, виклики сервісів, DTO, props, HTTP-запити.
 * ГЛОСАРІЙ:
 * - API: правила обміну даними між клієнтом (фронтенд) і сервером (бекенд).
 * - DTO: структура даних, яку дозволено приймати/повертати.
 * - Service: шар бізнес-логіки (обчислення, перевірки, робота з БД).
 * - Controller/Page: точка входу запиту користувача або сторінка інтерфейсу.
 * - Component: перевикористовуваний UI-блок.
 * - Prisma/ORM: інструмент доступу до бази даних через код.
 */


import { Controller, Get, Param, Query } from '@nestjs/common';
import { GamesService } from './games.service';

@Controller('games')
// Клас: GamesController. Об'єднує пов'язану логіку та методи в одному модулі для зрозумілого керування поведінкою.
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  // Метод: list. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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
