import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const DIFFICULTY_LEVELS = [1, 2, 3] as const;

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
      },
      orderBy: { id: "asc" },
    });

    return Promise.all(
      games.map(async (g) => {
        const versions = await this.prisma.taskVersion.findMany({
          where: {
            isCurrent: true,
            task: {
              gameId: g.id,
              isActive: true,
            },
          },
          select: { difficulty: true },
        });

        const difficultyTaskCounts = DIFFICULTY_LEVELS.map((difficulty) => ({
          difficulty,
          count: versions.filter((version) => version.difficulty === difficulty).length,
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
      }),
    );
  }
}
