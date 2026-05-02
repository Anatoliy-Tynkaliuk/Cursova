/**
 * 📘 ОГЛЯД ФАЙЛУ: `kids-platform-backend/backend/src/attempts/attempts.controller.ts`.
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


import { Body, Controller, Param, Post } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { StartAttemptDto } from './dto/start-attempt.dto';
import { AnswerDto } from './dto/answer.dto';
import { FinishDto } from './dto/finish.dto';

@Controller('attempts')
// Клас: AttemptsController. Об'єднує пов'язану логіку та методи в одному модулі для зрозумілого керування поведінкою.
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post('start')
  // Метод: start. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  start(@Body() dto: StartAttemptDto) {
    return this.attemptsService.start(
      dto.childProfileId,
      dto.gameId,
      dto.difficulty,
      dto.level,
      dto.levelId,
    );
  }

  @Post(':attemptId/answer')
  // Метод: answer. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  answer(@Param('attemptId') attemptId: string, @Body() dto: AnswerDto) {
    return this.attemptsService.answer(Number(attemptId), dto);
  }

  @Post(':attemptId/finish')
  // Метод: finish. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  finish(@Param('attemptId') attemptId: string, @Body() dto: FinishDto) {
    return this.attemptsService.finish(Number(attemptId), dto);
  }
}
