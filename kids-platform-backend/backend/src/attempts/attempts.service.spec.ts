import { answersAreEquivalent, AttemptsService } from "./attempts.service";

describe("answersAreEquivalent", () => {
  it("treats drag pairs as equal regardless of array order", () => {
    const userAnswer = {
      pairs: [
        { item: "Лев", target: "Тварини" },
        { item: "Яблуко", target: "Фрукти" },
        { item: "Груша", target: "Фрукти" },
      ],
    };

    const correctAnswer = {
      pairs: [
        { item: "Яблуко", target: "Фрукти" },
        { item: "Груша", target: "Фрукти" },
        { item: "Лев", target: "Тварини" },
      ],
    };

    expect(answersAreEquivalent(userAnswer, correctAnswer)).toBe(true);
  });

  it("detects wrong drag mapping", () => {
    const userAnswer = {
      pairs: [
        { item: "Лев", target: "Фрукти" },
        { item: "Яблуко", target: "Фрукти" },
      ],
    };

    const correctAnswer = {
      pairs: [
        { item: "Лев", target: "Тварини" },
        { item: "Яблуко", target: "Фрукти" },
      ],
    };

    expect(answersAreEquivalent(userAnswer, correctAnswer)).toBe(false);
  });
});

describe("AttemptsService unlockNextLevelIfNeeded", () => {
  function createService(prisma: any) {
    return new AttemptsService(prisma);
  }

  it("does nothing when attempt is missing", async () => {
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

  it("does not unlock next level for unsuccessful attempts", async () => {
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

  it("does not update progress when next level is already unlocked", async () => {
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

  it("updates maxUnlockedLevel for successful attempts", async () => {
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
