/**
 * ФАЙЛ: `src/attempts/attempts.controller.ts`.
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


import { Body, Controller, Param, Post } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { StartAttemptDto } from './dto/start-attempt.dto';
import { AnswerDto } from './dto/answer.dto';
import { FinishDto } from './dto/finish.dto';

@Controller('attempts')
// AttemptsController: клас, що інкапсулює відповідальність цього файлу та координує роботу методів.
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post('start')
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
  answer(@Param('attemptId') attemptId: string, @Body() dto: AnswerDto) {
    return this.attemptsService.answer(Number(attemptId), dto);
  }

  @Post(':attemptId/finish')
  finish(@Param('attemptId') attemptId: string, @Body() dto: FinishDto) {
    return this.attemptsService.finish(Number(attemptId), dto);
  }
}
