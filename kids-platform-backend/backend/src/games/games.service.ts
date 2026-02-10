import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const DIFFICULTY_LEVELS = [1, 2, 3] as const;

type LevelState = "locked" | "unlocked" | "completed";

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

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
      orderBy: { id: "asc" },
    });

    return games.map((g) => {
      const difficultyTaskCounts = DIFFICULTY_LEVELS.map((difficulty) => ({
        difficulty,
        count: g.levels.filter((level) => level.difficulty === difficulty).length,
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

  async levels(gameId: number, difficulty: number, childProfileId?: number) {
    if (!Number.isInteger(gameId) || gameId < 1) {
      throw new BadRequestException("gameId must be a positive integer");
    }

    if (!Number.isInteger(difficulty) || difficulty < 1) {
      throw new BadRequestException("difficulty must be a positive integer");
    }

    if (childProfileId !== undefined && (!Number.isInteger(childProfileId) || childProfileId < 1)) {
      throw new BadRequestException("childProfileId must be a positive integer");
    }

    const game = await this.prisma.game.findUnique({
      where: { id: BigInt(gameId) },
      include: { module: true },
    });

    if (!game || !game.isActive) {
      throw new NotFoundException("Game not found or inactive");
    }

    const levels = await this.prisma.gameLevel.findMany({
      where: {
        gameId: BigInt(gameId),
        difficulty,
        isActive: true,
        deletedAt: null,
      },
      orderBy: { levelNumber: "asc" },
    });

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

      for (const attempt of completedAttempts) {
        if (attempt.levelId) {
          completedLevelIds.add(attempt.levelId.toString());
        }
      }

      if (progress) {
        maxUnlockedLevel = progress.maxUnlockedLevel;
      }
    }

    const responseLevels = levels.map((level) => {
      const isCompleted = completedLevelIds.has(level.id.toString());
      let state: LevelState = "locked";

      if (isCompleted) {
        state = "completed";
      } else if (level.levelNumber <= maxUnlockedLevel) {
        state = "unlocked";
      }

      return {
        levelId: Number(level.id),
        level: level.levelNumber,
        title: level.title,
        state,
        isLocked: state === "locked",
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
