/**
 * Огляд файлу: `kids-platform-backend/backend/src/attempts/attempts.controller.ts`.
 * Призначення: містить частину логіки бекенду/фронтенду платформи навчальних ігор.
 * Взаємодія: імпортує типи, сервіси та компоненти з сусідніх модулів і передає дані через DTO/API props.
 * Терміни: API — контракт обміну даними; DTO — тип вхідних/вихідних даних; Service — бізнес-логіка; Controller/Page — точка входу запитів або UI-екран.
 */

import { Body, Controller, Param, Post } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { StartAttemptDto } from './dto/start-attempt.dto';
import { AnswerDto } from './dto/answer.dto';
import { FinishDto } from './dto/finish.dto';

@Controller('attempts')
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
