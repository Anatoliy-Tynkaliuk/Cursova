import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { buildAchievementRule, type AchievementMetrics } from "../../children/achievement-rules";
import { calculateAchievementMetrics } from "../../children/achievement-metrics";

@Injectable()
export class AchievementAwardService {
  constructor(private prisma: PrismaService) {}

  async awardBadges(childProfileId: bigint) {
    const [allAttempts, badges] = await Promise.all([
      this.prisma.attempt.findMany({ where: { childProfileId }, select: { createdAt: true, isFinished: true, correctCount: true, totalCount: true, score: true, levelId: true } }),
      this.prisma.badge.findMany(),
    ]);
    const metrics: AchievementMetrics = calculateAchievementMetrics(allAttempts);
    const eligibleBadges = badges.filter((badge) => {
      const rule = buildAchievementRule(badge.code, metrics);
      return rule ? rule.currentValue >= rule.targetValue : false;
    });
    if (eligibleBadges.length === 0) return;
    await this.prisma.childBadge.createMany({ data: eligibleBadges.map((badge) => ({ childProfileId, badgeId: badge.id })), skipDuplicates: true });
  }
}
