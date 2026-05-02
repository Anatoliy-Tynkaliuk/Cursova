/**
 * 📘 ОГЛЯД ФАЙЛУ: `kids-platform-backend/backend/src/games/games.service.ts`.
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

const DIFFICULTY_LEVELS = [1, 2, 3] as const;

type LevelState = 'locked' | 'unlocked' | 'completed';

@Injectable()
// Клас: GamesService. Об'єднує пов'язану логіку та методи в одному модулі для зрозумілого керування поведінкою.
export class GamesService {
  constructor(private prisma: PrismaService) {}

  // Метод: list. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  async list(ageGroupCode?: string) {
    const age = ageGroupCode
      ? await this.prisma.ageGroup.findUnique({ where: { code: ageGroupCode } })
      : null;

    const games = await this.prisma.game.findMany({
      where: {
        isActive: true,
        ...(age ? { minAgeGroupId: age.id } : {}),
      },
      include: {
        module: true,
        minAgeGroup: true,
        levels: {
          where: {
            isActive: true,
            deletedAt: null,
          },
          select: {
            difficulty: true,
            id: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    return games.map((g) => {
      const difficultyTaskCounts = DIFFICULTY_LEVELS.map((difficulty) => ({
        difficulty,
        count: g.levels.filter((level) => level.difficulty === difficulty)
          .length,
      }));

      const availableDifficulties = difficultyTaskCounts
        .filter((item) => item.count > 0)
        .map((item) => item.difficulty);

      return {
        id: Number(g.id),
        title: g.title,
        moduleCode: g.module.code,
        minAgeGroupCode: g.minAgeGroup.code,
        difficulty: g.difficulty,
        difficultyLevels: [...DIFFICULTY_LEVELS],
        availableDifficulties,
        difficultyTaskCounts,
      };
    });
  }

  // Метод: levels. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  async levels(gameId: number, difficulty: number, childProfileId?: number) {
  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
    if (!Number.isInteger(gameId) || gameId < 1) {
      throw new BadRequestException('gameId must be a positive integer');
    }

  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
    if (!Number.isInteger(difficulty) || difficulty < 1) {
      throw new BadRequestException('difficulty must be a positive integer');
    }

    if (
      childProfileId !== undefined &&
      (!Number.isInteger(childProfileId) || childProfileId < 1)
    ) {
      throw new BadRequestException(
        'childProfileId must be a positive integer',
      );
    }

    const game = await this.prisma.game.findUnique({
      where: { id: BigInt(gameId) },
      include: { module: true },
    });

  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
    if (!game || !game.isActive) {
      throw new NotFoundException('Game not found or inactive');
    }

    const levels = await this.prisma.gameLevel.findMany({
      where: {
        gameId: BigInt(gameId),
        difficulty,
        isActive: true,
        deletedAt: null,
      },
      orderBy: { levelNumber: 'asc' },
    });

  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
    if (levels.length === 0) {
      return {
        gameId,
        gameTitle: game.title,
        moduleCode: game.module.code,
        difficulty,
        levels: [],
      };
    }

    const completedLevelIds = new Set<string>();
    let maxUnlockedLevel = 1;

  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
    if (childProfileId !== undefined) {
      const [completedAttempts, progress] = await Promise.all([
        this.prisma.attempt.findMany({
          where: {
            childProfileId: BigInt(childProfileId),
            gameId: BigInt(gameId),
            levelId: { not: null },
            isFinished: true,
            correctCount: { gt: 0 },
          },
          select: {
            levelId: true,
          },
        }),
        this.prisma.childLevelProgress.findUnique({
          where: {
            childProfileId_gameId_difficulty: {
              childProfileId: BigInt(childProfileId),
              gameId: BigInt(gameId),
              difficulty,
            },
          },
          select: {
            maxUnlockedLevel: true,
          },
        }),
      ]);

  // Метод: for. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
      for (const attempt of completedAttempts) {
  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
        if (attempt.levelId) {
          completedLevelIds.add(attempt.levelId.toString());
        }
      }

  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
      if (progress) {
        maxUnlockedLevel = progress.maxUnlockedLevel;
      }
    }

    const responseLevels = levels.map((level) => {
      const isCompleted = completedLevelIds.has(level.id.toString());
      let state: LevelState = 'locked';

  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
      if (isCompleted) {
        state = 'completed';
      } else if (level.levelNumber <= maxUnlockedLevel) {
        state = 'unlocked';
      }

      return {
        levelId: Number(level.id),
        level: level.levelNumber,
        title: level.title,
        state,
        isLocked: state === 'locked',
        isCompleted,
      };
    });

    return {
      gameId,
      gameTitle: game.title,
      moduleCode: game.module.code,
      difficulty,
      maxUnlockedLevel,
      levels: responseLevels,
    };
  }
}
