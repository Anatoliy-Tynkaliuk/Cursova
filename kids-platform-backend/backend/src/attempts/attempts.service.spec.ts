import { AttemptsService } from "./attempts.service";

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

describe("AttemptsService saveLevelStarsIfNeeded", () => {
  function createService(prisma: any) {
    return new AttemptsService(prisma);
  }

  it("saves better stars for completed level", async () => {
    const prisma = {
      attempt: {
        findUnique: jest.fn().mockResolvedValue({
          childProfileId: BigInt(3),
          isFinished: true,
          correctCount: 4,
          totalCount: 5,
          level: {
            gameId: BigInt(7),
            difficulty: 1,
            levelNumber: 2,
          },
        }),
      },
      childLevelProgress: {
        findUnique: jest.fn().mockResolvedValue({
          childProfileId: BigInt(3),
          gameId: BigInt(7),
          difficulty: 1,
          maxUnlockedLevel: 2,
          starsJson: { "2": 1 },
        }),
        create: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
    };

    const service = createService(prisma);

    await (service as any).saveLevelStarsIfNeeded(BigInt(21));

    expect(prisma.childLevelProgress.update).toHaveBeenCalledWith({
      where: {
        childProfileId_gameId_difficulty: {
          childProfileId: BigInt(3),
          gameId: BigInt(7),
          difficulty: 1,
        },
      },
      data: {
        starsJson: { "2": 2 },
      },
    });
  });

  it("does not overwrite stars with lower value", async () => {
    const prisma = {
      attempt: {
        findUnique: jest.fn().mockResolvedValue({
          childProfileId: BigInt(4),
          isFinished: true,
          correctCount: 1,
          totalCount: 5,
          level: {
            gameId: BigInt(8),
            difficulty: 2,
            levelNumber: 3,
          },
        }),
      },
      childLevelProgress: {
        findUnique: jest.fn().mockResolvedValue({
          childProfileId: BigInt(4),
          gameId: BigInt(8),
          difficulty: 2,
          maxUnlockedLevel: 3,
          starsJson: { "3": 3 },
        }),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const service = createService(prisma);

    await (service as any).saveLevelStarsIfNeeded(BigInt(22));

    expect(prisma.childLevelProgress.update).not.toHaveBeenCalled();
  });
});
