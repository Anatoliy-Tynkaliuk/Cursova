import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AnswerDto } from "./dto/answer.dto";

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a && b && typeof a === "object") {
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
      return true;
    }
    const ak = Object.keys(a).sort();
    const bk = Object.keys(b).sort();
    if (!deepEqual(ak, bk)) return false;
    for (const k of ak) if (!deepEqual(a[k], b[k])) return false;
    return true;
  }
  return false;
}

@Injectable()
export class AttemptsService {
  constructor(private prisma: PrismaService) {}

  private parseFinishedAttemptsThreshold(code: string) {
    const match = code.match(/^FINISHED_(\d+)$/i);
    if (!match) return null;
    const value = Number(match[1]);
    return Number.isFinite(value) ? value : null;
  }

  private async awardBadges(childProfileId: bigint) {
    const finishedAttempts = await this.prisma.attempt.count({
      where: { childProfileId, isFinished: true },
    });

    const badges = await this.prisma.badge.findMany();

    const eligibleBadges = badges.filter((badge) => {
      const threshold = this.parseFinishedAttemptsThreshold(badge.code);
      return threshold !== null && finishedAttempts >= threshold;
    });

    if (eligibleBadges.length === 0) return;

    await this.prisma.childBadge.createMany({
      data: eligibleBadges.map((badge) => ({
        childProfileId,
        badgeId: badge.id,
      })),
      skipDuplicates: true,
    });
  }

  // ---------- START ----------
  async start(childProfileId: number, gameId: number) {
    if (!childProfileId || !gameId) {
      throw new BadRequestException("childProfileId and gameId are required");
    }

    const game = await this.prisma.game.findUnique({
      where: { id: BigInt(gameId) },
      include: {
        module: true,
        gameType: true,
      },
    });

    if (!game || !game.isActive) {
      throw new NotFoundException("Game not found or inactive");
    }

    const attempt = await this.prisma.attempt.create({
      data: {
        childProfileId: BigInt(childProfileId),
        gameId: BigInt(gameId),
        score: 0,
        correctCount: 0,
        totalCount: 0,
        isFinished: false,
      },
    });

    const task = await this.prisma.task.findFirst({
      where: { gameId: BigInt(gameId), isActive: true },
      orderBy: { position: "asc" },
    });

    if (!task) throw new NotFoundException("No tasks for this game");

    const tv = await this.prisma.taskVersion.findFirst({
      where: { taskId: task.id, isCurrent: true },
      orderBy: { version: "desc" },
    });

    if (!tv) throw new NotFoundException("No current task version");

    return {
      attemptId: Number(attempt.id),
      game: {
        id: Number(game.id),
        title: game.title,
        moduleCode: game.module.code,
        gameTypeCode: game.gameType.code,
      },
      task: {
        taskId: Number(task.id),
        position: task.position,
        type: game.gameType.code,
        taskVersion: {
          id: Number(tv.id),
          prompt: tv.prompt,
          data: tv.dataJson,
        },
      },
    };
  }

  // ---------- ANSWER ----------
  async answer(attemptId: number, dto: AnswerDto) {
    if (!attemptId) throw new BadRequestException("attemptId required");
    if (!dto?.taskId || !dto?.taskVersionId) {
      throw new BadRequestException("taskId and taskVersionId required");
    }

    const attempt = await this.prisma.attempt.findUnique({
      where: { id: BigInt(attemptId) },
    });

    if (!attempt) throw new NotFoundException("Attempt not found");
    if (attempt.isFinished) throw new BadRequestException("Attempt already finished");

    const tv = await this.prisma.taskVersion.findUnique({
      where: { id: BigInt(dto.taskVersionId) },
    });

    if (!tv) throw new NotFoundException("Task version not found");
    if (Number(tv.taskId) !== dto.taskId) {
      throw new BadRequestException("taskId does not match taskVersionId");
    }

    const isCorrect = deepEqual(dto.userAnswer, tv.correctJson);

    // запис відповіді (якщо вдруге на те ж саме task — впаде по @@unique(attemptId, taskId))
    await this.prisma.taskAnswer.create({
      data: {
        attemptId: BigInt(attemptId),
        taskId: BigInt(dto.taskId),
        taskVersionId: BigInt(dto.taskVersionId),
        userAnswer: dto.userAnswer,
        isCorrect,
      },
    });

    // оновити attempt
    const updated = await this.prisma.attempt.update({
      where: { id: BigInt(attemptId) },
      data: {
        totalCount: { increment: 1 },
        correctCount: { increment: isCorrect ? 1 : 0 },
        score: { increment: isCorrect ? 10 : 0 },
      },
    });

    // знайти позицію поточного task
    const currentTask = await this.prisma.task.findUnique({
      where: { id: BigInt(dto.taskId) },
      select: { position: true, gameId: true },
    });
    if (!currentTask) throw new BadRequestException("Task not found");

    // наступний task
    const nextTask = await this.prisma.task.findFirst({
      where: {
        gameId: currentTask.gameId,
        isActive: true,
        position: { gt: currentTask.position },
      },
      orderBy: { position: "asc" },
    });

    if (!nextTask) {
      // фініш
      const finished = await this.prisma.attempt.update({
        where: { id: BigInt(attemptId) },
        data: {
          isFinished: true,
          finishedAt: new Date(),
        },
      });
      await this.awardBadges(attempt.childProfileId);

      return {
        attemptId,
        isCorrect,
        finished: true,
        summary: {
          score: finished.score,
          correctCount: finished.correctCount,
          totalCount: finished.totalCount,
        },
      };
    }

    const nextTv = await this.prisma.taskVersion.findFirst({
      where: { taskId: nextTask.id, isCurrent: true },
      orderBy: { version: "desc" },
    });
    if (!nextTv) throw new NotFoundException("No current task version for next task");

    return {
      attemptId,
      isCorrect,
      finished: false,
      progress: {
        score: updated.score,
        correctCount: updated.correctCount,
        totalCount: updated.totalCount,
      },
      nextTask: {
        taskId: Number(nextTask.id),
        position: nextTask.position,
        taskVersion: {
          id: Number(nextTv.id),
          prompt: nextTv.prompt,
          data: nextTv.dataJson,
        },
      },
    };
  }

  // ---------- FINISH ----------
  async finish(attemptId: number, dto: { durationSec?: number }) {
    const finished = await this.prisma.attempt.update({
      where: { id: BigInt(attemptId) },
      data: {
        isFinished: true,
        finishedAt: new Date(),
        durationSec: dto?.durationSec ?? undefined,
      },
    });
    await this.awardBadges(finished.childProfileId);

    return {
      attemptId,
      finished: true,
      summary: {
        score: finished.score,
        correctCount: finished.correctCount,
        totalCount: finished.totalCount,
      },
    };
  }
}
