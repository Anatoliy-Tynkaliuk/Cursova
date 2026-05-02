/**
 * ФАЙЛ: `src/games/games.service.ts`.
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


import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DIFFICULTY_LEVELS = [1, 2, 3] as const;

type LevelState = 'locked' | 'unlocked' | 'completed';

@Injectable()
// GamesService: клас, що інкапсулює відповідальність цього файлу та координує роботу методів.
export class GamesService {
  constructor(private prisma: PrismaService) {}

  // Метод `list(ageGroupCode?: string)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
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

  // Метод `levels(gameId: number, difficulty: number, childProfileId?: number)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async levels(gameId: number, difficulty: number, childProfileId?: number) {
    if (!Number.isInteger(gameId) || gameId < 1) {
      throw new BadRequestException('gameId must be a positive integer');
    }

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

  // Метод `if(!game || !game.isActive)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
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

  // Метод `if(levels.length === 0)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
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

  // Метод `if(childProfileId !== undefined)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
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

  // Метод `for(const attempt of completedAttempts)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
      for (const attempt of completedAttempts) {
  // Метод `if(attempt.levelId)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
        if (attempt.levelId) {
          completedLevelIds.add(attempt.levelId.toString());
        }
      }

  // Метод `if(progress)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
      if (progress) {
        maxUnlockedLevel = progress.maxUnlockedLevel;
      }
    }

    const responseLevels = levels.map((level) => {
      const isCompleted = completedLevelIds.has(level.id.toString());
      let state: LevelState = 'locked';

  // Метод `if(isCompleted)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
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
