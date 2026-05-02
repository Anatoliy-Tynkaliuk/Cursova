/**
 * ФАЙЛ: `src/children/achievement-metrics.spec.ts`.
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
