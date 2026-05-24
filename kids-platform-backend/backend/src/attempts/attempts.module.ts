import { Module } from '@nestjs/common';
import { AttemptsController } from './attempts.controller';
import { AttemptsService } from './attempts.service';
import { AnswerValidationService } from "./services/answer-validation.service";
import { ProgressionService } from "./services/progression.service";
import { AchievementAwardService } from "./services/achievement-award.service";

@Module({
  controllers: [AttemptsController],
  providers: [AttemptsService, AnswerValidationService, ProgressionService, AchievementAwardService]
})
export class AttemptsModule {}
