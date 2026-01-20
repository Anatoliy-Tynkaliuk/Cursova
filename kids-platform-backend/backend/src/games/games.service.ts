import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

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
        gameType: true,
        minAgeGroup: true,
      },
      orderBy: { id: "asc" },
    });

    return games.map((g) => ({
      id: Number(g.id),
      title: g.title,
      moduleCode: g.module.code,
      gameTypeCode: g.gameType.code,
      minAgeGroupCode: g.minAgeGroup.code,
      difficulty: g.difficulty,
    }));
  }
}
