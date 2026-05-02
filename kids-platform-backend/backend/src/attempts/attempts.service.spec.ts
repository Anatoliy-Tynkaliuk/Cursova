/**
 * 📘 ОГЛЯД ФАЙЛУ: `kids-platform-backend/backend/src/attempts/attempts.service.spec.ts`.
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


import { AttemptsService } from './attempts.service';

describe('AttemptsService unlockNextLevelIfNeeded', () => {
  // Функція: createService. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: createService. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
  function createService(prisma: any) {
    return new AttemptsService(prisma);
  }

  it('does nothing when attempt is missing', async () => {
    const prisma = {
      attempt: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      childLevelProgress: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const service = createService(prisma);

    await (service as any).unlockNextLevelIfNeeded(BigInt(11));

    expect(prisma.childLevelProgress.findUnique).not.toHaveBeenCalled();
    expect(prisma.childLevelProgress.update).not.toHaveBeenCalled();
  });

  it('does not unlock next level for unsuccessful attempts', async () => {
    const prisma = {
      attempt: {
        findUnique: jest.fn().mockResolvedValue({
          childProfileId: BigInt(2),
          isFinished: true,
          correctCount: 0,
          level: {
            gameId: BigInt(5),
            difficulty: 2,
            levelNumber: 3,
          },
        }),
      },
      childLevelProgress: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const service = createService(prisma);

    await (service as any).unlockNextLevelIfNeeded(BigInt(12));

    expect(prisma.childLevelProgress.findUnique).not.toHaveBeenCalled();
    expect(prisma.childLevelProgress.update).not.toHaveBeenCalled();
  });

  it('does not update progress when next level is already unlocked', async () => {
    const prisma = {
      attempt: {
        findUnique: jest.fn().mockResolvedValue({
          childProfileId: BigInt(2),
          isFinished: true,
          correctCount: 4,
          level: {
            gameId: BigInt(5),
            difficulty: 2,
            levelNumber: 3,
          },
        }),
      },
      childLevelProgress: {
        findUnique: jest.fn().mockResolvedValue({
          childProfileId: BigInt(2),
          gameId: BigInt(5),
          difficulty: 2,
          maxUnlockedLevel: 4,
        }),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const service = createService(prisma);

    await (service as any).unlockNextLevelIfNeeded(BigInt(13));

    expect(prisma.childLevelProgress.update).not.toHaveBeenCalled();
    expect(prisma.childLevelProgress.create).not.toHaveBeenCalled();
  });

  it('updates maxUnlockedLevel for successful attempts', async () => {
    const prisma = {
      attempt: {
        findUnique: jest.fn().mockResolvedValue({
          childProfileId: BigInt(7),
          isFinished: true,
          correctCount: 2,
          level: {
            gameId: BigInt(9),
            difficulty: 1,
            levelNumber: 2,
          },
        }),
      },
      childLevelProgress: {
        findUnique: jest.fn().mockResolvedValue({
          childProfileId: BigInt(7),
          gameId: BigInt(9),
          difficulty: 1,
          maxUnlockedLevel: 2,
        }),
        create: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
    };

    const service = createService(prisma);

    await (service as any).unlockNextLevelIfNeeded(BigInt(14));

    expect(prisma.childLevelProgress.update).toHaveBeenCalledWith({
      where: {
        childProfileId_gameId_difficulty: {
          childProfileId: BigInt(7),
          gameId: BigInt(9),
          difficulty: 1,
        },
      },
      data: {
        maxUnlockedLevel: 3,
      },
    });
  });
});
