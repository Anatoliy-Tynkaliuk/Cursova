import type { AchievementMetrics } from "./achievement-rules";

type AttemptMetricRow = {
  createdAt: Date;
  isFinished: boolean;
  correctCount: number;
  totalCount: number;
  score: number;
  levelId: bigint | null;
};

function getLevelKey(levelId: bigint | null) {
  return levelId ? levelId.toString() : null;
}

export function calculateAchievementMetrics(attempts: AttemptMetricRow[]): AchievementMetrics {
  const loginDays = new Set(attempts.map((attempt) => attempt.createdAt.toISOString().slice(0, 10))).size;

  const bestFinishedByLevel = new Map<string, AttemptMetricRow>();
  const finishedWithoutLevel: AttemptMetricRow[] = [];
  const allLevelKeys = new Set<string>();
  let attemptsWithoutLevelCount = 0;

  for (const attempt of attempts) {
    const levelKey = getLevelKey(attempt.levelId);

    if (levelKey) {
      allLevelKeys.add(levelKey);
    } else {
      attemptsWithoutLevelCount += 1;
    }

    if (!attempt.isFinished) {
      continue;
    }

    if (!levelKey) {
      finishedWithoutLevel.push(attempt);
      continue;
    }

    const previousBest = bestFinishedByLevel.get(levelKey);
    const isBetter =
      !previousBest ||
      attempt.score > previousBest.score ||
      (attempt.score === previousBest.score && attempt.correctCount > previousBest.correctCount);

    if (isBetter) {
      bestFinishedByLevel.set(levelKey, attempt);
    }
  }

  let totalStars = 0;
  let correctAnswers = 0;
  let perfectGames = 0;

  for (const attempt of bestFinishedByLevel.values()) {
    totalStars += attempt.score;
    correctAnswers += attempt.correctCount;
    if (attempt.totalCount > 0 && attempt.correctCount === attempt.totalCount) {
      perfectGames += 1;
    }
  }

  for (const attempt of finishedWithoutLevel) {
    totalStars += attempt.score;
    correctAnswers += attempt.correctCount;
    if (attempt.totalCount > 0 && attempt.correctCount === attempt.totalCount) {
      perfectGames += 1;
    }
  }

  return {
    finishedAttempts: bestFinishedByLevel.size + finishedWithoutLevel.length,
    totalStars,
    loginDays,
    correctAnswers,
    totalAttempts: allLevelKeys.size + attemptsWithoutLevelCount,
    perfectGames,
  };
}