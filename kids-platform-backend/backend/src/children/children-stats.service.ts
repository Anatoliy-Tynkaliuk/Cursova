import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { buildAchievementRule, type AchievementMetrics } from "./achievement-rules";
import { calculateAchievementMetrics } from "./achievement-metrics";
import { ChildrenAccessPolicy } from "./children-access.policy";

@Injectable()
export class ChildrenStatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessPolicy: ChildrenAccessPolicy,
  ) {}

  async getStats(user: any, childId: number) {
    this.accessPolicy.ensureParentOrAdmin(user);

    const child = await this.prisma.childProfile.findFirst({ where: { id: BigInt(childId), isActive: true }, include: { ageGroup: true } });
    if (!child || !child.isActive) throw new NotFoundException("Child not found");
    await this.accessPolicy.ensureParentOwnsChild(user, child.id);

    const attempts = await this.prisma.attempt.findMany({ where: { childProfileId: child.id }, include: { game: { include: { module: true, gameType: true } } }, orderBy: { createdAt: "desc" }, take: 50 });
    const allAttemptsForSummary = await this.prisma.attempt.findMany({ where: { childProfileId: child.id }, select: { levelId: true, isFinished: true, score: true, correctCount: true, totalCount: true } });

    const activityWindowDays = 365;
    const todayUtc = new Date(); todayUtc.setUTCHours(0, 0, 0, 0);
    const activityStartUtc = new Date(todayUtc); activityStartUtc.setUTCDate(activityStartUtc.getUTCDate() - (activityWindowDays - 1));

    const recentAttempts = await this.prisma.attempt.findMany({ where: { childProfileId: child.id, createdAt: { gte: activityStartUtc } }, select: { createdAt: true, finishedAt: true, durationSec: true, isFinished: true, correctCount: true }, orderBy: { createdAt: "asc" } });

    const activityByDate = new Map<string, { didPlay: boolean; levelsPassed: number; durationSec: number }>();
    for (const attempt of recentAttempts) {
      const dateKey = attempt.createdAt.toISOString().slice(0, 10);
      const prev = activityByDate.get(dateKey) ?? { didPlay: false, levelsPassed: 0, durationSec: 0 };
      prev.didPlay = true;
      const fallbackDuration = attempt.finishedAt ? Math.max(0, Math.floor((attempt.finishedAt.getTime() - attempt.createdAt.getTime()) / 1000)) : 0;
      const effectiveDuration = Math.max(0, attempt.durationSec ?? fallbackDuration);
      prev.durationSec += effectiveDuration;
      if (attempt.isFinished && attempt.correctCount > 0) prev.levelsPassed += 1;
      activityByDate.set(dateKey, prev);
    }

    const activityYearDays = Array.from({ length: activityWindowDays }, (_, idx) => {
      const day = new Date(activityStartUtc); day.setUTCDate(activityStartUtc.getUTCDate() + idx);
      const date = day.toISOString().slice(0, 10);
      const stats = activityByDate.get(date) ?? { didPlay: false, levelsPassed: 0, durationSec: 0 };
      return { date, ...stats };
    });

    const bestFinishedByLevel = new Map<string, { score: number; correctCount: number; totalCount: number }>();
    const finishedWithoutLevel: Array<{ score: number; correctCount: number; totalCount: number }> = [];
    const uniqueLevelAttempts = new Set<string>();
    let attemptsWithoutLevelCount = 0;
    for (const attempt of allAttemptsForSummary) {
      if (attempt.levelId) {
        const levelKey = attempt.levelId.toString(); uniqueLevelAttempts.add(levelKey);
        if (!attempt.isFinished) continue;
        const prevBest = bestFinishedByLevel.get(levelKey);
        if (!prevBest || attempt.score > prevBest.score || (attempt.score === prevBest.score && attempt.correctCount > prevBest.correctCount)) {
          bestFinishedByLevel.set(levelKey, { score: attempt.score, correctCount: attempt.correctCount, totalCount: attempt.totalCount });
        }
      } else {
        attemptsWithoutLevelCount += 1;
        if (attempt.isFinished) finishedWithoutLevel.push({ score: attempt.score, correctCount: attempt.correctCount, totalCount: attempt.totalCount });
      }
    }

    let totalScore = 0, totalCorrect = 0, totalQuestions = 0;
    for (const best of bestFinishedByLevel.values()) { totalScore += best.score; totalCorrect += best.correctCount; totalQuestions += best.totalCount; }
    for (const item of finishedWithoutLevel) { totalScore += item.score; totalCorrect += item.correctCount; totalQuestions += item.totalCount; }

    const totalAttempts = uniqueLevelAttempts.size + attemptsWithoutLevelCount;
    const finishedAttempts = bestFinishedByLevel.size + finishedWithoutLevel.length;

    return {
      child: { id: Number(child.id), name: child.name, ageGroupCode: child.ageGroup.code },
      summary: { totalAttempts, finishedAttempts, totalScore, totalCorrect, totalQuestions, activityYearDays },
      attempts: attempts.map((a) => ({
        id: Number(a.id), game: { id: Number(a.game.id), title: a.game.title, moduleCode: a.game.module.code },
        score: a.score, correctCount: a.correctCount, totalCount: a.totalCount, isFinished: a.isFinished,
        durationSec: a.durationSec ?? (a.finishedAt ? Math.max(0, Math.floor((a.finishedAt.getTime() - a.createdAt.getTime()) / 1000)) : null),
        createdAt: a.createdAt, finishedAt: a.finishedAt,
      })),
    };
  }

  async getBadges(user: any, childId: number) {
    this.accessPolicy.ensureOptionalParentOrAdmin(user);

    const child = await this.prisma.childProfile.findFirst({ where: { id: BigInt(childId), isActive: true } });
    if (!child || !child.isActive) throw new NotFoundException("Child not found");
    if (user?.role === "parent") await this.accessPolicy.ensureParentOwnsChild(user, child.id);

    const [allAttempts, badges, earned] = await Promise.all([
      this.prisma.attempt.findMany({ where: { childProfileId: child.id }, select: { createdAt: true, isFinished: true, correctCount: true, totalCount: true, score: true, levelId: true, game: { select: { module: { select: { code: true } } } } } }),
      this.prisma.badge.findMany({ orderBy: { id: "asc" } }),
      this.prisma.childBadge.findMany({ where: { childProfileId: child.id } }),
    ]);

    const metrics: AchievementMetrics = calculateAchievementMetrics(allAttempts);
    const moduleMetrics = {
      logic: calculateAchievementMetrics(allAttempts.filter((attempt) => attempt.game?.module?.code === "logic")),
      math: calculateAchievementMetrics(allAttempts.filter((attempt) => attempt.game?.module?.code === "math")),
      english: calculateAchievementMetrics(allAttempts.filter((attempt) => attempt.game?.module?.code === "english")),
    };

    const earnedSet = new Set(earned.map((b) => Number(b.badgeId)));

    return {
      finishedAttempts: metrics.finishedAttempts,
      totalStars: metrics.totalStars,
      loginDays: metrics.loginDays,
      totalAttempts: metrics.totalAttempts,
      correctAnswers: metrics.correctAnswers,
      perfectGames: metrics.perfectGames,
      moduleStats: {
        logic: { finishedAttempts: moduleMetrics.logic.finishedAttempts, totalStars: moduleMetrics.logic.totalStars },
        math: { finishedAttempts: moduleMetrics.math.finishedAttempts, totalStars: moduleMetrics.math.totalStars },
        english: { finishedAttempts: moduleMetrics.english.finishedAttempts, totalStars: moduleMetrics.english.totalStars },
      },
      badges: badges.map((badge) => {
        const rule = buildAchievementRule(badge.code, metrics);
        return { id: Number(badge.id), code: badge.code, title: badge.title, description: badge.description, isEarned: earnedSet.has(Number(badge.id)), metricKey: rule?.metricKey ?? null, metricLabel: rule?.metricLabel ?? null, currentValue: rule?.currentValue ?? null, targetValue: rule?.targetValue ?? null, progressPercent: rule?.progressPercent ?? null };
      }),
    };
  }
}
