/**
 * 📘 ОГЛЯД ФАЙЛУ: `kids-platform-backend/backend/src/children/achievement-metrics.ts`.
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


import type { AchievementMetrics } from './achievement-rules';

type AttemptMetricRow = {
  createdAt: Date;
  isFinished: boolean;
  correctCount: number;
  totalCount: number;
  score: number;
  levelId: bigint | null;
};

// Функція: getLevelKey. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: getLevelKey. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
function getLevelKey(levelId: bigint | null) {
  return levelId ? levelId.toString() : null;
}

// Функція: calculateAchievementMetrics. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: calculateAchievementMetrics. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export function calculateAchievementMetrics(
  attempts: AttemptMetricRow[],
): AchievementMetrics {
  const loginDays = new Set(
    attempts.map((attempt) => attempt.createdAt.toISOString().slice(0, 10)),
  ).size;

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
      (attempt.score === previousBest.score &&
        attempt.correctCount > previousBest.correctCount);

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
