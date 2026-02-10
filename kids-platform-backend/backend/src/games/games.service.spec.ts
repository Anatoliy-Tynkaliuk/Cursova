import { GamesService } from "./games.service";

describe("GamesService.levels", () => {
  function createService(prisma: any) {
    return new GamesService(prisma);
  }

  const baseGame = {
    id: BigInt(1),
    title: "Logic Quest",
    isActive: true,
    module: { code: "logic" },
  };

  const baseLevels = [
    { id: BigInt(101), levelNumber: 1, title: "L1" },
    { id: BigInt(102), levelNumber: 2, title: "L2" },
    { id: BigInt(103), levelNumber: 3, title: "L3" },
  ];

  it("returns locked/unlocked states when no child progress is provided", async () => {
    const prisma = {
      game: {
        findUnique: jest.fn().mockResolvedValue(baseGame),
      },
      gameLevel: {
        findMany: jest.fn().mockResolvedValue(baseLevels),
      },
      attempt: {
        findMany: jest.fn(),
      },
      childLevelProgress: {
        findUnique: jest.fn(),
      },
    };

    const service = createService(prisma);

    const result = await service.levels(1, 1);

    expect(result.maxUnlockedLevel).toBe(1);
    expect(result.levels.map((x) => x.state)).toEqual(["unlocked", "locked", "locked"]);
    expect(result.levels.map((x) => x.isCompleted)).toEqual([false, false, false]);
    expect(prisma.attempt.findMany).not.toHaveBeenCalled();
    expect(prisma.childLevelProgress.findUnique).not.toHaveBeenCalled();
  });

  it("marks completed/unlocked/locked correctly based on attempts and progress", async () => {
    const prisma = {
      game: {
        findUnique: jest.fn().mockResolvedValue(baseGame),
      },
      gameLevel: {
        findMany: jest.fn().mockResolvedValue(baseLevels),
      },
      attempt: {
        findMany: jest.fn().mockResolvedValue([
          { levelId: BigInt(101) },
        ]),
      },
      childLevelProgress: {
        findUnique: jest.fn().mockResolvedValue({ maxUnlockedLevel: 2 }),
      },
    };

    const service = createService(prisma);

    const result = await service.levels(1, 1, 10);

    expect(result.maxUnlockedLevel).toBe(2);
    expect(result.levels.map((x) => ({ level: x.level, state: x.state }))).toEqual([
      { level: 1, state: "completed" },
      { level: 2, state: "unlocked" },
      { level: 3, state: "locked" },
    ]);
  });

  it("keeps completed state even when levelNumber is above maxUnlockedLevel", async () => {
    const prisma = {
      game: {
        findUnique: jest.fn().mockResolvedValue(baseGame),
      },
      gameLevel: {
        findMany: jest.fn().mockResolvedValue(baseLevels),
      },
      attempt: {
        findMany: jest.fn().mockResolvedValue([
          { levelId: BigInt(103) },
        ]),
      },
      childLevelProgress: {
        findUnique: jest.fn().mockResolvedValue({ maxUnlockedLevel: 1 }),
      },
    };

    const service = createService(prisma);

    const result = await service.levels(1, 1, 10);

    expect(result.levels.map((x) => ({ level: x.level, state: x.state }))).toEqual([
      { level: 1, state: "unlocked" },
      { level: 2, state: "locked" },
      { level: 3, state: "completed" },
    ]);
  });

  it("throws BadRequestException for invalid input params", async () => {
    const prisma = {
      game: { findUnique: jest.fn() },
      gameLevel: { findMany: jest.fn() },
      attempt: { findMany: jest.fn() },
      childLevelProgress: { findUnique: jest.fn() },
    };

    const service = createService(prisma);

    await expect(service.levels(0, 1)).rejects.toMatchObject({ message: "gameId must be a positive integer" });
    await expect(service.levels(1, 0)).rejects.toMatchObject({ message: "difficulty must be a positive integer" });
    await expect(service.levels(1, 1, 0)).rejects.toMatchObject({ message: "childProfileId must be a positive integer" });
  });

  it("throws NotFoundException when game is missing or inactive", async () => {
    const prisma = {
      game: {
        findUnique: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({ ...baseGame, isActive: false }),
      },
      gameLevel: { findMany: jest.fn() },
      attempt: { findMany: jest.fn() },
      childLevelProgress: { findUnique: jest.fn() },
    };

    const service = createService(prisma);

    await expect(service.levels(1, 1)).rejects.toMatchObject({ message: "Game not found or inactive" });
    await expect(service.levels(1, 1)).rejects.toMatchObject({ message: "Game not found or inactive" });
  });

  it("returns empty level list when there are no active levels for difficulty", async () => {
    const prisma = {
      game: {
        findUnique: jest.fn().mockResolvedValue(baseGame),
      },
      gameLevel: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      attempt: {
        findMany: jest.fn(),
      },
      childLevelProgress: {
        findUnique: jest.fn(),
      },
    };

    const service = createService(prisma);

    const result = await service.levels(1, 2, 10);

    expect(result).toEqual({
      gameId: 1,
      gameTitle: "Logic Quest",
      moduleCode: "logic",
      difficulty: 2,
      levels: [],
    });
    expect(prisma.attempt.findMany).not.toHaveBeenCalled();
    expect(prisma.childLevelProgress.findUnique).not.toHaveBeenCalled();
  });
});

describe("GamesService.list", () => {
  function createService(prisma: any) {
    return new GamesService(prisma);
  }

  it("builds difficulty counters and available difficulties", async () => {
    const prisma = {
      ageGroup: {
        findUnique: jest.fn(),
      },
      game: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: BigInt(1),
            title: "Logic Quest",
            module: { code: "logic" },
            minAgeGroup: { code: "6_8" },
            difficulty: 1,
            levels: [
              { id: BigInt(10), difficulty: 1 },
              { id: BigInt(11), difficulty: 1 },
              { id: BigInt(12), difficulty: 3 },
            ],
          },
        ]),
      },
    };

    const service = createService(prisma);

    const result = await service.list();

    expect(prisma.ageGroup.findUnique).not.toHaveBeenCalled();
    expect(prisma.game.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true },
      }),
    );

    expect(result).toEqual([
      {
        id: 1,
        title: "Logic Quest",
        moduleCode: "logic",
        minAgeGroupCode: "6_8",
        difficulty: 1,
        difficultyLevels: [1, 2, 3],
        availableDifficulties: [1, 3],
        difficultyTaskCounts: [
          { difficulty: 1, count: 2 },
          { difficulty: 2, count: 0 },
          { difficulty: 3, count: 1 },
        ],
      },
    ]);
  });

  it("applies age-group filter when ageGroupCode exists", async () => {
    const prisma = {
      ageGroup: {
        findUnique: jest.fn().mockResolvedValue({ id: BigInt(22), code: "9_12" }),
      },
      game: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const service = createService(prisma);

    await service.list("9_12");

    expect(prisma.ageGroup.findUnique).toHaveBeenCalledWith({ where: { code: "9_12" } });
    expect(prisma.game.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isActive: true,
          minAgeGroupId: BigInt(22),
        },
      }),
    );
  });
});
