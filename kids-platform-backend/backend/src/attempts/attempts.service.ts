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

  private async getOrCreateLevelProgress(childProfileId: bigint, gameId: bigint, difficulty: number) {
    let progress = await this.prisma.childLevelProgress.findUnique({
      where: {
        childProfileId_gameId_difficulty: {
          childProfileId,
          gameId,
          difficulty,
        },
      },
    });

    if (!progress) {
      progress = await this.prisma.childLevelProgress.create({
        data: {
          childProfileId,
          gameId,
          difficulty,
          maxUnlockedLevel: 1,
        },
      });
    }

    return progress;
  }

  private async unlockNextLevelIfNeeded(attemptId: bigint) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        level: {
          select: {
            gameId: true,
            difficulty: true,
            levelNumber: true,
          },
        },
      },
    });

    if (!attempt || !attempt.level) return;

    const isSuccessfulAttempt = attempt.isFinished && attempt.correctCount > 0;
    if (!isSuccessfulAttempt) {
      return;
    }

    const targetUnlockedLevel = attempt.level.levelNumber + 1;

    const progress = await this.getOrCreateLevelProgress(
      attempt.childProfileId,
      attempt.level.gameId,
      attempt.level.difficulty,
    );

    if (targetUnlockedLevel <= progress.maxUnlockedLevel) {
      return;
    }

    await this.prisma.childLevelProgress.update({
      where: {
        childProfileId_gameId_difficulty: {
          childProfileId: attempt.childProfileId,
          gameId: attempt.level.gameId,
          difficulty: attempt.level.difficulty,
        },
      },
      data: {
        maxUnlockedLevel: targetUnlockedLevel,
      },
    });
  }

  // ---------- START ----------
  async start(childProfileId: number, gameId: number, difficulty: number, level?: number, levelId?: number) {
    if (!childProfileId || !gameId) {
      throw new BadRequestException("childProfileId and gameId are required");
    }

    if (!Number.isInteger(difficulty) || difficulty < 1) {
      throw new BadRequestException("difficulty must be a positive integer");
    }

    if (level !== undefined && (!Number.isInteger(level) || level < 1)) {
      throw new BadRequestException("level must be a positive integer");
    }

    if (levelId !== undefined && (!Number.isInteger(levelId) || levelId < 1)) {
      throw new BadRequestException("levelId must be a positive integer");
    }

    if (level !== undefined && levelId !== undefined) {
      throw new BadRequestException("Use either level or levelId, not both");
    }

    const game = await this.prisma.game.findUnique({
      where: { id: BigInt(gameId) },
      include: {
        module: true,
      },
    });

    if (!game || !game.isActive) {
      throw new NotFoundException("Game not found or inactive");
    }

    let selectedLevel = null as null | {
      id: bigint;
      levelNumber: number;
      title: string;
    };

    if (levelId !== undefined) {
      selectedLevel = await this.prisma.gameLevel.findFirst({
        where: {
          id: BigInt(levelId),
          gameId: BigInt(gameId),
          difficulty,
          isActive: true,
          deletedAt: null,
        },
        select: { id: true, levelNumber: true, title: true },
      });

      if (!selectedLevel) {
        throw new NotFoundException("Level not found or inactive for this game/difficulty");
      }
    } else {
      selectedLevel = await this.prisma.gameLevel.findFirst({
        where: {
          gameId: BigInt(gameId),
          difficulty,
          isActive: true,
          deletedAt: null,
          ...(level !== undefined ? { levelNumber: level } : {}),
        },
        orderBy: { levelNumber: "asc" },
        select: { id: true, levelNumber: true, title: true },
      });

      if (!selectedLevel) {
        if (level !== undefined) {
          throw new NotFoundException(`Level ${level} is not available for this game and difficulty`);
        }
        throw new NotFoundException("No active levels for this game and difficulty");
      }
    }

    const progress = await this.getOrCreateLevelProgress(BigInt(childProfileId), BigInt(gameId), difficulty);
    if (selectedLevel.levelNumber > progress.maxUnlockedLevel) {
      throw new BadRequestException("Selected level is locked for this child");
    }

    const task = await this.prisma.task.findFirst({
      where: {
        gameId: BigInt(gameId),
        levelId: selectedLevel.id,
        isActive: true,
      },
      orderBy: { position: "asc" },
    });

    if (!task) throw new NotFoundException("No tasks for selected level");

    let tv = await this.prisma.taskVersion.findFirst({
      where: {
        taskId: task.id,
        isCurrent: true,
        difficulty,
      },
      orderBy: [{ version: "desc" }],
    });

    if (!tv) {
      tv = await this.prisma.taskVersion.findFirst({
        where: {
          taskId: task.id,
          isCurrent: true,
        },
        orderBy: [{ version: "desc" }],
      });
    }

    if (!tv) {
      throw new NotFoundException(`No current task version for difficulty ${difficulty}`);
    }

    const attempt = await this.prisma.attempt.create({
      data: {
        childProfileId: BigInt(childProfileId),
        gameId: BigInt(gameId),
        levelId: selectedLevel.id,
        score: 0,
        correctCount: 0,
        totalCount: 0,
        isFinished: false,
      },
    });

    return {
      attemptId: Number(attempt.id),
      game: {
        id: Number(game.id),
        title: game.title,
        moduleCode: game.module.code,
      },
      level: {
        id: Number(selectedLevel.id),
        number: selectedLevel.levelNumber,
        title: selectedLevel.title,
      },
      task: {
        taskId: Number(task.id),
        position: task.position,
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

    await this.prisma.taskAnswer.create({
      data: {
        attemptId: BigInt(attemptId),
        taskId: BigInt(dto.taskId),
        taskVersionId: BigInt(dto.taskVersionId),
        userAnswer: dto.userAnswer,
        isCorrect,
      },
    });

    const updated = await this.prisma.attempt.update({
      where: { id: BigInt(attemptId) },
      data: {
        totalCount: { increment: 1 },
        correctCount: { increment: isCorrect ? 1 : 0 },
        score: { increment: isCorrect ? 10 : 0 },
      },
    });

    const currentTask = await this.prisma.task.findUnique({
      where: { id: BigInt(dto.taskId) },
      select: { position: true, gameId: true, levelId: true },
    });
    if (!currentTask) throw new BadRequestException("Task not found");

    const nextTask = await this.prisma.task.findFirst({
      where: {
        gameId: currentTask.gameId,
        levelId: attempt.levelId,
        isActive: true,
        position: { gt: currentTask.position },
        versions: {
          some: {
            isCurrent: true,
            difficulty: tv.difficulty,
          },
        },
      },
      orderBy: { position: "asc" },
      include: {
        versions: {
          where: {
            isCurrent: true,
            difficulty: tv.difficulty,
          },
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });

    if (!nextTask) {
      const finished = await this.prisma.attempt.update({
        where: { id: BigInt(attemptId) },
        data: {
          isFinished: true,
          finishedAt: new Date(),
        },
      });
      await this.awardBadges(attempt.childProfileId);
      await this.unlockNextLevelIfNeeded(BigInt(attemptId));

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

    const nextTv = nextTask.versions[0];
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
    await this.unlockNextLevelIfNeeded(BigInt(attemptId));

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
