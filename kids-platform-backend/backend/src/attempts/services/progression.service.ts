import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ProgressionService {
  constructor(private prisma: PrismaService) {}

  calculateStars(correctCount: number, totalTasks: number) {
    if (correctCount <= 0) return 0;
    if (totalTasks <= 0) return Math.min(3, correctCount);
    return Math.min(3, Math.max(1, Math.ceil((correctCount / totalTasks) * 3)));
  }

  async getOrCreateLevelProgress(childProfileId: bigint, gameId: bigint, difficulty: number) {
    let progress = await this.prisma.childLevelProgress.findUnique({ where: { childProfileId_gameId_difficulty: { childProfileId, gameId, difficulty } } });
    if (!progress) {
      progress = await this.prisma.childLevelProgress.create({ data: { childProfileId, gameId, difficulty, maxUnlockedLevel: 1 } });
    }
    return progress;
  }

  async unlockNextLevelIfNeeded(attemptId: bigint) {
    const attempt = await this.prisma.attempt.findUnique({ where: { id: attemptId }, include: { level: { select: { gameId: true, difficulty: true, levelNumber: true } } } });
    if (!attempt || !attempt.level) return;
    if (!(attempt.isFinished && attempt.correctCount > 0)) return;
    const targetUnlockedLevel = attempt.level.levelNumber + 1;
    const progress = await this.getOrCreateLevelProgress(attempt.childProfileId, attempt.level.gameId, attempt.level.difficulty);
    if (targetUnlockedLevel <= progress.maxUnlockedLevel) return;
    await this.prisma.childLevelProgress.update({ where: { childProfileId_gameId_difficulty: { childProfileId: attempt.childProfileId, gameId: attempt.level.gameId, difficulty: attempt.level.difficulty } }, data: { maxUnlockedLevel: targetUnlockedLevel } });
  }
}
