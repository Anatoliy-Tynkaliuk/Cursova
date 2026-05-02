/**
 * 📘 ОГЛЯД ФАЙЛУ: `kids-platform-backend/backend/src/children/achievement-metrics.spec.ts`.
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


import { calculateAchievementMetrics } from './achievement-metrics';

describe('calculateAchievementMetrics', () => {
  it('counts each finished level once using best score', () => {
    const metrics = calculateAchievementMetrics([
      {
        createdAt: new Date('2026-01-01T10:00:00Z'),
        isFinished: true,
        correctCount: 1,
        totalCount: 3,
        score: 1,
        levelId: BigInt(10),
      },
      {
        createdAt: new Date('2026-01-01T11:00:00Z'),
        isFinished: true,
        correctCount: 3,
        totalCount: 3,
        score: 3,
        levelId: BigInt(10),
      },
    ]);

    expect(metrics.finishedAttempts).toBe(1);
    expect(metrics.totalStars).toBe(3);
    expect(metrics.correctAnswers).toBe(3);
    expect(metrics.perfectGames).toBe(1);
    expect(metrics.totalAttempts).toBe(1);
    expect(metrics.loginDays).toBe(1);
  });

  it('includes attempts without levelId as separate attempts', () => {
    const metrics = calculateAchievementMetrics([
      {
        createdAt: new Date('2026-01-01T10:00:00Z'),
        isFinished: false,
        correctCount: 0,
        totalCount: 0,
        score: 0,
        levelId: null,
      },
      {
        createdAt: new Date('2026-01-02T10:00:00Z'),
        isFinished: true,
        correctCount: 2,
        totalCount: 2,
        score: 2,
        levelId: null,
      },
    ]);

    expect(metrics.finishedAttempts).toBe(1);
    expect(metrics.totalStars).toBe(2);
    expect(metrics.correctAnswers).toBe(2);
    expect(metrics.perfectGames).toBe(1);
    expect(metrics.totalAttempts).toBe(2);
    expect(metrics.loginDays).toBe(2);
  });
});
