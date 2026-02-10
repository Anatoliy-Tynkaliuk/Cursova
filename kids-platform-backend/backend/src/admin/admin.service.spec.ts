import { BadRequestException, NotFoundException } from "@nestjs/common";
import { AdminService } from "./admin.service";

describe("AdminService task-level validation", () => {
  function createService(prisma: any) {
    return new AdminService(prisma);
  }

  it("throws when creating task with level that does not belong to game", async () => {
    const prisma = {
      gameLevel: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      task: {
        create: jest.fn(),
      },
    };

    const service = createService(prisma);

    await expect(
      service.createTask({ gameId: 1, levelId: 99, position: 1, isActive: true }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.task.create).not.toHaveBeenCalled();
  });

  it("throws NotFoundException when updating missing task", async () => {
    const prisma = {
      task: {
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
      },
    };

    const service = createService(prisma);

    await expect(service.updateTask(123, { position: 2 })).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.task.update).not.toHaveBeenCalled();
  });

  it("throws when moving task to another game with incompatible existing level", async () => {
    const prisma = {
      task: {
        findUnique: jest.fn().mockResolvedValue({
          gameId: BigInt(1),
          levelId: BigInt(10),
        }),
        update: jest.fn(),
      },
      gameLevel: {
        findFirst: jest.fn().mockResolvedValueOnce(null),
      },
    };

    const service = createService(prisma);

    await expect(service.updateTask(5, { gameId: 2 })).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.task.update).not.toHaveBeenCalled();
  });

  it("allows explicit null level detachment on update", async () => {
    const prisma = {
      task: {
        findUnique: jest.fn().mockResolvedValue({
          gameId: BigInt(1),
          levelId: BigInt(10),
        }),
        update: jest.fn().mockResolvedValue({ id: BigInt(7) }),
      },
      gameLevel: {
        findFirst: jest.fn(),
      },
    };

    const service = createService(prisma);

    await expect(service.updateTask(7, { levelId: null })).resolves.toEqual({ id: 7 });

    expect(prisma.task.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: BigInt(7) },
        data: expect.objectContaining({ levelId: null }),
      }),
    );
  });
});


describe("AdminService createGame without game types", () => {
  function createService(prisma: any) {
    return new AdminService(prisma);
  }

  it("uses existing first game type when gameTypeId is omitted", async () => {
    const prisma = {
      gameType: {
        findFirst: jest.fn().mockResolvedValue({ id: BigInt(3) }),
        create: jest.fn(),
      },
      game: {
        create: jest.fn().mockResolvedValue({ id: BigInt(17) }),
      },
    };

    const service = createService(prisma);

    await expect(
      service.createGame({
        moduleId: 1,
        minAgeGroupId: 2,
        title: "Logic game",
      }),
    ).resolves.toEqual({ id: 17 });

    expect(prisma.gameType.create).not.toHaveBeenCalled();
    expect(prisma.game.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ gameTypeId: BigInt(3) }),
      }),
    );
  });

  it("creates fallback game type when none exist", async () => {
    const prisma = {
      gameType: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: BigInt(9) }),
      },
      game: {
        create: jest.fn().mockResolvedValue({ id: BigInt(21) }),
      },
    };

    const service = createService(prisma);

    await expect(
      service.createGame({
        moduleId: 1,
        minAgeGroupId: 2,
        title: "Memory",
      }),
    ).resolves.toEqual({ id: 21 });

    expect(prisma.gameType.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ code: "default", title: "Default", isActive: true }),
      }),
    );
    expect(prisma.game.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ gameTypeId: BigInt(9) }),
      }),
    );
  });
});
