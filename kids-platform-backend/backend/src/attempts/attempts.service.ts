/**
 * 📘 ОГЛЯД ФАЙЛУ: `kids-platform-backend/backend/src/attempts/attempts.service.ts`.
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


import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnswerDto } from './dto/answer.dto';
import {
  buildAchievementRule,
  type AchievementMetrics,
} from '../children/achievement-rules';
import { calculateAchievementMetrics } from '../children/achievement-metrics';

// Функція: deepEqual. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: deepEqual. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a && b && typeof a === 'object') {
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++)
        if (!deepEqual(a[i], b[i])) return false;
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

type DragPair = { item: string; target: string };

// Функція: normalizeDragPairsValue. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: normalizeDragPairsValue. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
function normalizeDragPairsValue(value: unknown): DragPair[] | null {
  if (!value || typeof value !== 'object') return null;

  // Функція: pairs. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: pairs. Локальний обробник подій/даних, який викликається з цього файлу або з JSX.
  const pairs = (value as { pairs?: unknown }).pairs;
  if (!Array.isArray(pairs)) return null;

  const normalized: DragPair[] = [];

  for (const pair of pairs) {
    if (!pair || typeof pair !== 'object') return null;

    // Функція: item. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: item. Локальний обробник подій/даних, який викликається з цього файлу або з JSX.
    const item = (pair as { item?: unknown }).item;
// Функція: target. Локальний обробник подій/даних, який викликається з цього файлу або з JSX.
    const target = (pair as { target?: unknown }).target;

    if (typeof item !== 'string' || typeof target !== 'string') return null;

    normalized.push({ item: item.trim(), target: target.trim() });
  }

  normalized.sort((a, b) => {
    if (a.target === b.target) {
      return a.item.localeCompare(b.item);
    }

    return a.target.localeCompare(b.target);
  });

  return normalized;
}

// Функція: answersAreEquivalent. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: answersAreEquivalent. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export function answersAreEquivalent(
  userAnswer: unknown,
  correctAnswer: unknown,
): boolean {
  const normalizedUserPairs = normalizeDragPairsValue(userAnswer);
  const normalizedCorrectPairs = normalizeDragPairsValue(correctAnswer);

  if (normalizedUserPairs && normalizedCorrectPairs) {
    return deepEqual(normalizedUserPairs, normalizedCorrectPairs);
  }

  return deepEqual(userAnswer, correctAnswer);
}

@Injectable()
// Клас: AttemptsService. Об'єднує пов'язану логіку та методи в одному модулі для зрозумілого керування поведінкою.
export class AttemptsService {
  constructor(private prisma: PrismaService) {}

  // Метод: awardBadges. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  private async awardBadges(childProfileId: bigint) {
    const [allAttempts, badges] = await Promise.all([
      this.prisma.attempt.findMany({
        where: { childProfileId },
        select: {
          createdAt: true,
          isFinished: true,
          correctCount: true,
          totalCount: true,
          score: true,
          levelId: true,
        },
      }),
      this.prisma.badge.findMany(),
    ]);

    const metrics: AchievementMetrics =
      calculateAchievementMetrics(allAttempts);

    const eligibleBadges = badges.filter((badge) => {
      const rule = buildAchievementRule(badge.code, metrics);
      return rule ? rule.currentValue >= rule.targetValue : false;
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

  // Метод: calculateStars. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  private calculateStars(correctCount: number, totalTasks: number) {
    if (correctCount <= 0) return 0;
    if (totalTasks <= 0) return Math.min(3, correctCount);

    return Math.min(3, Math.max(1, Math.ceil((correctCount / totalTasks) * 3)));
  }

  private async getOrCreateLevelProgress(
    childProfileId: bigint,
    gameId: bigint,
    difficulty: number,
  ) {
    let progress = await this.prisma.childLevelProgress.findUnique({
      where: {
        childProfileId_gameId_difficulty: {
          childProfileId,
          gameId,
          difficulty,
        },
      },
    });

  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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

  // Метод: unlockNextLevelIfNeeded. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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
  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
    if (!isSuccessfulAttempt) {
      return;
    }

    const targetUnlockedLevel = attempt.level.levelNumber + 1;

    const progress = await this.getOrCreateLevelProgress(
      attempt.childProfileId,
      attempt.level.gameId,
      attempt.level.difficulty,
    );

  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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
  async start(
    childProfileId: number,
    gameId: number,
    difficulty: number,
    level?: number,
    levelId?: number,
  ) {
  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
    if (!childProfileId || !gameId) {
      throw new BadRequestException('childProfileId and gameId are required');
    }

  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
    if (!Number.isInteger(difficulty) || difficulty < 1) {
      throw new BadRequestException('difficulty must be a positive integer');
    }

  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
    if (level !== undefined && (!Number.isInteger(level) || level < 1)) {
      throw new BadRequestException('level must be a positive integer');
    }

  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
    if (levelId !== undefined && (!Number.isInteger(levelId) || levelId < 1)) {
      throw new BadRequestException('levelId must be a positive integer');
    }

  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
    if (level !== undefined && levelId !== undefined) {
      throw new BadRequestException('Use either level or levelId, not both');
    }

    const game = await this.prisma.game.findUnique({
      where: { id: BigInt(gameId) },
      include: {
        module: true,
      },
    });

  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
    if (!game || !game.isActive) {
      throw new NotFoundException('Game not found or inactive');
    }

    let selectedLevel = null as null | {
      id: bigint;
      levelNumber: number;
      title: string;
    };

  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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

  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
      if (!selectedLevel) {
        throw new NotFoundException(
          'Level not found or inactive for this game/difficulty',
        );
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
        orderBy: { levelNumber: 'asc' },
        select: { id: true, levelNumber: true, title: true },
      });

  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
      if (!selectedLevel) {
  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
        if (level !== undefined) {
          throw new NotFoundException(
            `Level ${level} is not available for this game and difficulty`,
          );
        }
        throw new NotFoundException(
          'No active levels for this game and difficulty',
        );
      }
    }

    const progress = await this.getOrCreateLevelProgress(
      BigInt(childProfileId),
      BigInt(gameId),
      difficulty,
    );
  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
    if (selectedLevel.levelNumber > progress.maxUnlockedLevel) {
      throw new BadRequestException('Selected level is locked for this child');
    }

    const task = await this.prisma.task.findFirst({
      where: {
        gameId: BigInt(gameId),
        levelId: selectedLevel.id,
        isActive: true,
      },
      orderBy: { position: 'asc' },
    });

    if (!task) throw new NotFoundException('No tasks for selected level');

    let tv = await this.prisma.taskVersion.findFirst({
      where: {
        taskId: task.id,
        isCurrent: true,
        difficulty,
      },
      orderBy: [{ version: 'desc' }],
    });

  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
    if (!tv) {
      tv = await this.prisma.taskVersion.findFirst({
        where: {
          taskId: task.id,
          isCurrent: true,
        },
        orderBy: [{ version: 'desc' }],
      });
    }

  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
    if (!tv) {
      throw new NotFoundException(
        `No current task version for difficulty ${difficulty}`,
      );
    }

    const totalTasks = await this.prisma.task.count({
      where: {
        gameId: BigInt(gameId),
        levelId: selectedLevel.id,
        isActive: true,
      },
    });

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
      totalTasks,
      task: {
        taskId: Number(task.id),
        position: task.position,
        taskVersion: {
          id: Number(tv.id),
          prompt: tv.prompt,
          data: tv.dataJson,
          explanation: tv.explanation,
        },
      },
    };
  }

  // ---------- ANSWER ----------
  // Метод: answer. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  async answer(attemptId: number, dto: AnswerDto) {
    if (!attemptId) throw new BadRequestException('attemptId required');
  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
    if (!dto?.taskId || !dto?.taskVersionId) {
      throw new BadRequestException('taskId and taskVersionId required');
    }

    const attempt = await this.prisma.attempt.findUnique({
      where: { id: BigInt(attemptId) },
    });

    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.isFinished)
      throw new BadRequestException('Attempt already finished');

    const tv = await this.prisma.taskVersion.findUnique({
      where: { id: BigInt(dto.taskVersionId) },
    });

    if (!tv) throw new NotFoundException('Task version not found');
  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
    if (Number(tv.taskId) !== dto.taskId) {
      throw new BadRequestException('taskId does not match taskVersionId');
    }

    const isCorrect = answersAreEquivalent(dto.userAnswer, tv.correctJson);

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
        score: { increment: isCorrect ? 1 : 0 },
      },
    });

    const currentTask = await this.prisma.task.findUnique({
      where: { id: BigInt(dto.taskId) },
      select: { position: true, gameId: true, levelId: true },
    });
    if (!currentTask) throw new BadRequestException('Task not found');

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
      orderBy: { position: 'asc' },
      include: {
        versions: {
          where: {
            isCurrent: true,
            difficulty: tv.difficulty,
          },
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    const totalTasks = await this.prisma.task.count({
      where: {
        gameId: currentTask.gameId,
        levelId: attempt.levelId,
        isActive: true,
      },
    });

  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
    if (!nextTask) {
      const finished = await this.prisma.attempt.update({
        where: { id: BigInt(attemptId) },
        data: {
          isFinished: true,
          finishedAt: new Date(),
          score: this.calculateStars(updated.correctCount, totalTasks),
        },
      });
      await this.awardBadges(attempt.childProfileId);
      await this.unlockNextLevelIfNeeded(BigInt(attemptId));

      return {
        attemptId,
        isCorrect,
        finished: true,
        explanation: tv.explanation,
        summary: {
          score: finished.score,
          correctCount: finished.correctCount,
          totalCount: finished.totalCount,
        },
      };
    }

    const nextTv = nextTask.versions[0];
    if (!nextTv)
      throw new NotFoundException('No current task version for next task');

    return {
      attemptId,
      isCorrect,
      finished: false,
      explanation: tv.explanation,
      progress: {
        score: updated.score,
        correctCount: updated.correctCount,
        totalCount: updated.totalCount,
        totalTasks,
      },
      nextTask: {
        taskId: Number(nextTask.id),
        position: nextTask.position,
        taskVersion: {
          id: Number(nextTv.id),
          prompt: nextTv.prompt,
          data: nextTv.dataJson,
          explanation: nextTv.explanation,
        },
      },
    };
  }

  // ---------- FINISH ----------
  // Метод: finish. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  async finish(attemptId: number, dto: { durationSec?: number }) {
    const updatedAttempt = await this.prisma.attempt.update({
      where: { id: BigInt(attemptId) },
      data: {
        isFinished: true,
        finishedAt: new Date(),
        durationSec: dto?.durationSec ?? undefined,
      },
    });

    const totalTasks = await this.prisma.task.count({
      where: {
        gameId: updatedAttempt.gameId,
        levelId: updatedAttempt.levelId,
        isActive: true,
      },
    });

    const finished = await this.prisma.attempt.update({
      where: { id: BigInt(attemptId) },
      data: {
        score: this.calculateStars(updatedAttempt.correctCount, totalTasks),
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
