import { Body, Controller, Param, Post } from "@nestjs/common";
import { AttemptsService } from "./attempts.service";
import { StartAttemptDto } from "./dto/start-attempt.dto";
import { AnswerDto } from "./dto/answer.dto";
import { FinishDto } from "./dto/finish.dto";

@Controller("attempts")
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post("start")
  start(@Body() dto: StartAttemptDto) {
    return this.attemptsService.start(dto.childProfileId, dto.gameId, dto.difficulty);
  }

  @Post(":attemptId/answer")
  answer(@Param("attemptId") attemptId: string, @Body() dto: AnswerDto) {
    return this.attemptsService.answer(Number(attemptId), dto);
  }

  @Post(":attemptId/finish")
  finish(@Param("attemptId") attemptId: string, @Body() dto: FinishDto) {
    return this.attemptsService.finish(Number(attemptId), dto);
  }
}
