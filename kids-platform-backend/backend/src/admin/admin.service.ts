import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import {
  CreateAgeGroupDto,
  CreateGameDto,
  CreateGameTypeDto,
  CreateModuleDto,
  CreateTaskDto,
  CreateTaskVersionDto,
  CreateBadgeDto,
  UpdateAgeGroupDto,
  UpdateGameDto,
  UpdateGameTypeDto,
  UpdateModuleDto,
  UpdateTaskDto,
  UpdateTaskVersionDto,
  UpdateBadgeDto,
  CreateGameLevelDto,
  UpdateGameLevelDto,
} from "./dto";

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  private async hardDeleteLevelInTx(tx: Prisma.TransactionClient, levelId: bigint) {
    await tx.attempt.updateMany({
      where: { levelId },
      data: { levelId: null },
    });

    await tx.taskAnswer.deleteMany({
      where: {
        task: {
          levelId,
        },
      },
    });

    await tx.taskVersion.deleteMany({
      where: {
        task: {
          levelId,
        },
      },
    });

    await tx.task.deleteMany({ where: { levelId } });
    await tx.gameLevel.delete({ where: { id: levelId } });
  }

  private async ensureLevelNumberAvailable(params: {
    gameId: bigint;
    difficulty: number;
    levelNumber: number;
    excludeLevelId?: bigint;
  }) {
    const existing = await this.prisma.gameLevel.findFirst({
      where: {
        gameId: params.gameId,
        difficulty: params.difficulty,
        levelNumber: params.levelNumber,
        deletedAt: null,
        ...(params.excludeLevelId ? { id: { not: params.excludeLevelId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new BadRequestException(
        `Level number ${params.levelNumber} already exists for this game and difficulty`,
      );
    }
  }

  private async ensureBaseGameTypes() {
    await this.prisma.gameType.upsert({
      where: { code: "test" },
      update: { title: "Тест", isActive: true },
      create: { code: "test", title: "Тест", isActive: true },
    });

    await this.prisma.gameType.upsert({
      where: { code: "drag" },
      update: { title: "Перетягування", isActive: true },
      create: { code: "drag", title: "Перетягування", isActive: true },
    });
  }

  private async resolveGameTypeId(gameTypeId?: number) {
    await this.ensureBaseGameTypes();

    if (gameTypeId) {
      return BigInt(gameTypeId);
    }

    const fallbackType = await this.prisma.gameType.findFirst({
      where: { code: "test" },
      select: { id: true },
    });

    if (!fallbackType) {
      throw new BadRequestException("default game type is not configured");
    }

    return fallbackType.id;
  }


  private async ensureTaskLevelBelongsToGame(gameId: bigint, levelId: number) {
    const level = await this.prisma.gameLevel.findFirst({
      where: {
        id: BigInt(levelId),
        gameId,
        isActive: true,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!level) {
      throw new BadRequestException("levelId is invalid for selected game");
    }

    return level.id;
  }

  async listAgeGroups() {
    const groups = await this.prisma.ageGroup.findMany({ orderBy: { id: "asc" } });
    return groups.map((g) => ({
      id: Number(g.id),
      code: g.code,
      title: g.title,
      minAge: g.minAge,
      maxAge: g.maxAge,
      sortOrder: g.sortOrder,
      isActive: g.isActive,
    }));
  }

  async createAgeGroup(dto: CreateAgeGroupDto) {
    const group = await this.prisma.ageGroup.create({
      data: {
        code: dto.code,
        title: dto.title,
        minAge: dto.minAge,
        maxAge: dto.maxAge,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
    return { id: Number(group.id) };
  }

  async updateAgeGroup(id: number, dto: UpdateAgeGroupDto) {
    const group = await this.prisma.ageGroup.update({
      where: { id: BigInt(id) },
      data: {
        code: dto.code,
        title: dto.title,
        minAge: dto.minAge,
        maxAge: dto.maxAge,
        sortOrder: dto.sortOrder,
        isActive: dto.isActive,
      },
    });
    return { id: Number(group.id) };
  }

  async deleteAgeGroup(id: number) {
    await this.prisma.ageGroup.delete({ where: { id: BigInt(id) } });
    return { ok: true };
  }

  async listModules() {
    const modules = await this.prisma.module.findMany({ orderBy: { id: "asc" } });
    return modules.map((m) => ({
      id: Number(m.id),
      code: m.code,
      title: m.title,
      description: m.description,
      icon: m.icon,
      isActive: m.isActive,
    }));
  }

  async createModule(dto: CreateModuleDto) {
    const module = await this.prisma.module.create({
      data: {
        code: dto.code,
        title: dto.title,
        description: dto.description,
        icon: dto.icon,
        isActive: dto.isActive ?? true,
      },
    });
    return { id: Number(module.id) };
  }

  async updateModule(id: number, dto: UpdateModuleDto) {
    const module = await this.prisma.module.update({
      where: { id: BigInt(id) },
      data: {
        code: dto.code,
        title: dto.title,
        description: dto.description,
        icon: dto.icon,
        isActive: dto.isActive,
      },
    });
    return { id: Number(module.id) };
  }

  async deleteModule(id: number) {
    await this.prisma.module.delete({ where: { id: BigInt(id) } });
    return { ok: true };
  }

  async listGameTypes() {
    await this.ensureBaseGameTypes();

    const types = await this.prisma.gameType.findMany({
      where: { code: { in: ["test", "drag"] } },
      orderBy: { id: "asc" },
    });
    return types.map((t) => ({
      id: Number(t.id),
      code: t.code,
      title: t.title,
      description: t.description,
      icon: t.icon,
      isActive: t.isActive,
    }));
  }

  async createGameType(dto: CreateGameTypeDto) {
    const type = await this.prisma.gameType.create({
      data: {
        code: dto.code,
        title: dto.title,
        description: dto.description,
        icon: dto.icon,
        isActive: dto.isActive ?? true,
      },
    });
    return { id: Number(type.id) };
  }

  async updateGameType(id: number, dto: UpdateGameTypeDto) {
    const type = await this.prisma.gameType.update({
      where: { id: BigInt(id) },
      data: {
        code: dto.code,
        title: dto.title,
        description: dto.description,
        icon: dto.icon,
        isActive: dto.isActive,
      },
    });
    return { id: Number(type.id) };
  }

  async deleteGameType(id: number) {
    await this.prisma.gameType.delete({ where: { id: BigInt(id) } });
    return { ok: true };
  }

  async listGames() {
    const games = await this.prisma.game.findMany({
      orderBy: { id: "asc" },
      include: { module: true, gameType: true, minAgeGroup: true },
    });
    return games.map((g) => ({
      id: Number(g.id),
      title: g.title,
      description: g.description,
      moduleId: Number(g.moduleId),
      moduleCode: g.module.code,
      gameTypeId: Number(g.gameTypeId),
      gameTypeCode: g.gameType.code,
      minAgeGroupId: Number(g.minAgeGroupId),
      minAgeGroupCode: g.minAgeGroup.code,
      difficulty: g.difficulty,
      isActive: g.isActive,
    }));
  }

  async createGame(dto: CreateGameDto) {
    const gameTypeId = await this.resolveGameTypeId(dto.gameTypeId);

    const game = await this.prisma.game.create({
      data: {
        moduleId: BigInt(dto.moduleId),
        gameTypeId,
        minAgeGroupId: BigInt(dto.minAgeGroupId),
        title: dto.title,
        description: dto.description,
        difficulty: dto.difficulty ?? 1,
        isActive: dto.isActive ?? true,
      },
    });
    return { id: Number(game.id) };
  }

  async updateGame(id: number, dto: UpdateGameDto) {
    const game = await this.prisma.game.update({
      where: { id: BigInt(id) },
      data: {
        moduleId: dto.moduleId ? BigInt(dto.moduleId) : undefined,
        gameTypeId: dto.gameTypeId ? BigInt(dto.gameTypeId) : undefined,
        minAgeGroupId: dto.minAgeGroupId ? BigInt(dto.minAgeGroupId) : undefined,
        title: dto.title,
        description: dto.description,
        difficulty: dto.difficulty,
        isActive: dto.isActive,
      },
    });
    return { id: Number(game.id) };
  }

  async deleteGame(id: number) {
    await this.prisma.game.delete({ where: { id: BigInt(id) } });
    return { ok: true };
  }

  async listGameLevels(gameId?: number) {
    const levels = await this.prisma.gameLevel.findMany({
      where: {
        ...(gameId ? { gameId: BigInt(gameId) } : {}),
        deletedAt: null,
      },
      include: { game: true },
      orderBy: [{ gameId: "asc" }, { difficulty: "asc" }, { levelNumber: "asc" }],
    });

    return levels.map((level) => ({
      id: Number(level.id),
      gameId: Number(level.gameId),
      gameTitle: level.game.title,
      difficulty: level.difficulty,
      levelNumber: level.levelNumber,
      title: level.title,
      isActive: level.isActive,
      deletedAt: level.deletedAt,
      createdAt: level.createdAt,
      updatedAt: level.updatedAt,
    }));
  }

  async createGameLevel(dto: CreateGameLevelDto) {
    if (![1, 2, 3].includes(dto.difficulty)) {
      throw new BadRequestException("difficulty must be one of 1, 2, 3");
    }

    if (dto.levelNumber !== undefined && (!Number.isInteger(dto.levelNumber) || dto.levelNumber < 1)) {
      throw new BadRequestException("levelNumber must be a positive integer");
    }

    const gameId = BigInt(dto.gameId);

    const level = await this.prisma.$transaction(async (tx) => {
      await tx.gameLevel.deleteMany({
        where: {
          gameId,
          difficulty: dto.difficulty,
          deletedAt: { not: null },
        },
      });

      let levelNumber = dto.levelNumber;

      if (!levelNumber) {
        const maxLevel = await tx.gameLevel.aggregate({
          where: {
            gameId,
            difficulty: dto.difficulty,
            deletedAt: null,
          },
          _max: { levelNumber: true },
        });
        levelNumber = (maxLevel._max.levelNumber ?? 0) + 1;
      } else {
        const existing = await tx.gameLevel.findFirst({
          where: {
            gameId,
            difficulty: dto.difficulty,
            levelNumber,
            deletedAt: null,
          },
          select: { id: true },
        });

        if (existing) {
          throw new BadRequestException(
            `Level number ${levelNumber} already exists for this game and difficulty`,
          );
        }
      }

      try {
        return await tx.gameLevel.create({
          data: {
            gameId,
            difficulty: dto.difficulty,
            levelNumber,
            title: dto.title,
            isActive: dto.isActive ?? true,
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          const conflicting = await tx.gameLevel.findFirst({
            where: {
              gameId,
              difficulty: dto.difficulty,
              levelNumber,
            },
            select: { id: true, deletedAt: true },
          });

          if (conflicting?.deletedAt) {
            await this.hardDeleteLevelInTx(tx, conflicting.id);

            return tx.gameLevel.create({
              data: {
                gameId,
                difficulty: dto.difficulty,
                levelNumber,
                title: dto.title,
                isActive: dto.isActive ?? true,
              },
            });
          }

          throw new BadRequestException(
            `Level number ${levelNumber} already exists for this game and difficulty`,
          );
        }

        throw error;
      }
    });

    return { id: Number(level.id) };
  }

  async updateGameLevel(id: number, dto: UpdateGameLevelDto) {
    if (dto.levelNumber !== undefined && (!Number.isInteger(dto.levelNumber) || dto.levelNumber < 1)) {
      throw new BadRequestException("levelNumber must be a positive integer");
    }

    const currentLevel = await this.prisma.gameLevel.findUnique({
      where: { id: BigInt(id) },
      select: { id: true, gameId: true, difficulty: true, levelNumber: true, deletedAt: true },
    });

    if (!currentLevel || currentLevel.deletedAt) {
      throw new NotFoundException("Level not found");
    }

    if (dto.levelNumber !== undefined && dto.levelNumber !== currentLevel.levelNumber) {
      await this.ensureLevelNumberAvailable({
        gameId: currentLevel.gameId,
        difficulty: currentLevel.difficulty,
        levelNumber: dto.levelNumber,
        excludeLevelId: currentLevel.id,
      });
    }

    const level = await this.prisma.gameLevel.update({
      where: { id: BigInt(id) },
      data: {
        title: dto.title,
        levelNumber: dto.levelNumber,
        isActive: dto.isActive,
      },
    });
    return { id: Number(level.id) };
  }

  async deleteGameLevel(id: number) {
    const levelId = BigInt(id);

    await this.prisma.$transaction(async (tx) => {
      await this.hardDeleteLevelInTx(tx, levelId);
    });

    return { ok: true };
  }

  async listTasks() {
    const tasks = await this.prisma.task.findMany({
      orderBy: { id: "asc" },
      include: { game: true },
    });

    const levelIds = Array.from(
      new Set(tasks.filter((task) => task.levelId !== null).map((task) => task.levelId!.toString())),
    );

    const levels = levelIds.length
      ? await this.prisma.gameLevel.findMany({
          where: {
            id: {
              in: levelIds.map((id) => BigInt(id)),
            },
          },
          select: {
            id: true,
            levelNumber: true,
            difficulty: true,
          },
        })
      : [];

    const levelById = new Map(levels.map((level) => [level.id.toString(), level]));

    return tasks.map((t) => {
      const level = t.levelId ? levelById.get(t.levelId.toString()) : undefined;

      return {
        id: Number(t.id),
        gameId: Number(t.gameId),
        gameTitle: t.game.title,
        levelId: t.levelId ? Number(t.levelId) : null,
        levelNumber: level?.levelNumber ?? null,
        difficulty: level?.difficulty ?? null,
        position: t.position,
        isActive: t.isActive,
      };
    });
  }

  async createTask(dto: CreateTaskDto) {
    const gameId = BigInt(dto.gameId);
    const levelId = dto.levelId !== undefined ? await this.ensureTaskLevelBelongsToGame(gameId, dto.levelId) : undefined;

    const task = await this.prisma.task.create({
      data: {
        gameId,
        levelId,
        position: dto.position,
        isActive: dto.isActive ?? true,
      },
    });
    return { id: Number(task.id) };
  }

  async updateTask(id: number, dto: UpdateTaskDto) {
    const currentTask = await this.prisma.task.findUnique({
      where: { id: BigInt(id) },
      select: { gameId: true, levelId: true },
    });

    if (!currentTask) {
      throw new NotFoundException("Task not found");
    }

    const targetGameId = dto.gameId !== undefined ? BigInt(dto.gameId) : currentTask.gameId;

    let levelId: bigint | null | undefined = undefined;
    if (dto.levelId !== undefined) {
      levelId = dto.levelId === null ? null : await this.ensureTaskLevelBelongsToGame(targetGameId, dto.levelId);
    } else if (dto.gameId !== undefined && currentTask.levelId) {
      const existingLevelMatchesGame = await this.prisma.gameLevel.findFirst({
        where: {
          id: currentTask.levelId,
          gameId: targetGameId,
          isActive: true,
          deletedAt: null,
        },
        select: { id: true },
      });

      if (!existingLevelMatchesGame) {
        throw new BadRequestException("Existing level does not belong to selected game. Provide levelId or null.");
      }
    }

    const task = await this.prisma.task.update({
      where: { id: BigInt(id) },
      data: {
        gameId: dto.gameId ? BigInt(dto.gameId) : undefined,
        levelId,
        position: dto.position,
        isActive: dto.isActive,
      },
    });
    return { id: Number(task.id) };
  }

  async deleteTask(id: number) {
    const taskId = BigInt(id);

    await this.prisma.$transaction(async (tx) => {
      await tx.taskAnswer.deleteMany({ where: { taskId } });
      await tx.taskVersion.deleteMany({ where: { taskId } });
      await tx.task.delete({ where: { id: taskId } });
    });

    return { ok: true };
  }

  async listTaskVersions() {
    const versions = await this.prisma.taskVersion.findMany({
      orderBy: { id: "asc" },
      include: { task: true },
    });
    return versions.map((v) => ({
      id: Number(v.id),
      taskId: Number(v.taskId),
      taskPosition: v.task.position,
      version: v.version,
      prompt: v.prompt,
      dataJson: v.dataJson,
      correctJson: v.correctJson,
      explanation: v.explanation,
      difficulty: v.difficulty,
      isCurrent: v.isCurrent,
    }));
  }

  async createTaskVersion(dto: CreateTaskVersionDto) {
    const task = await this.prisma.task.findUnique({
      where: { id: BigInt(dto.taskId) },
      include: {
        level: {
          select: { difficulty: true },
        },
      },
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    const resolvedDifficulty = task.level ? task.level.difficulty : (dto.difficulty ?? 1);

    const version = await this.prisma.taskVersion.create({
      data: {
        taskId: BigInt(dto.taskId),
        version: dto.version,
        prompt: dto.prompt,
        dataJson: dto.dataJson ?? {},
        correctJson: dto.correctJson,
        explanation: dto.explanation,
        difficulty: resolvedDifficulty,
        isCurrent: dto.isCurrent ?? false,
      },
    });
    return { id: Number(version.id) };
  }

  async updateTaskVersion(id: number, dto: UpdateTaskVersionDto) {
    if (dto.taskId !== undefined || dto.difficulty !== undefined) {
      const currentVersion = await this.prisma.taskVersion.findUnique({
        where: { id: BigInt(id) },
        select: { taskId: true },
      });

      if (!currentVersion) {
        throw new NotFoundException("Task version not found");
      }

      const effectiveTaskId = dto.taskId ?? Number(currentVersion.taskId);
      const task = await this.prisma.task.findUnique({
        where: { id: BigInt(effectiveTaskId) },
        include: {
          level: {
            select: { difficulty: true },
          },
        },
      });

      if (!task) {
        throw new NotFoundException("Task not found");
      }

      if (task.level && dto.difficulty !== undefined && dto.difficulty !== task.level.difficulty) {
        throw new BadRequestException("Task version difficulty must match linked level difficulty");
      }

      if (task.level) {
        dto.difficulty = task.level.difficulty;
      }
    }

    const version = await this.prisma.taskVersion.update({
      where: { id: BigInt(id) },
      data: {
        taskId: dto.taskId ? BigInt(dto.taskId) : undefined,
        version: dto.version,
        prompt: dto.prompt,
        dataJson: dto.dataJson,
        correctJson: dto.correctJson,
        explanation: dto.explanation,
        difficulty: dto.difficulty,
        isCurrent: dto.isCurrent,
      },
    });
    return { id: Number(version.id) };
  }

  async deleteTaskVersion(id: number) {
    await this.prisma.taskVersion.delete({ where: { id: BigInt(id) } });
    return { ok: true };
  }

  async listBadges() {
    const badges = await this.prisma.badge.findMany({ orderBy: { id: "asc" } });
    return badges.map((b) => ({
      id: Number(b.id),
      code: b.code,
      title: b.title,
      description: b.description,
      icon: b.icon,
    }));
  }

  async createBadge(dto: CreateBadgeDto) {
    const badge = await this.prisma.badge.create({
      data: {
        code: dto.code,
        title: dto.title,
        description: dto.description,
        icon: dto.icon,
      },
    });
    return { id: Number(badge.id) };
  }

  async updateBadge(id: number, dto: UpdateBadgeDto) {
    const badge = await this.prisma.badge.update({
      where: { id: BigInt(id) },
      data: {
        code: dto.code,
        title: dto.title,
        description: dto.description,
        icon: dto.icon,
      },
    });
    return { id: Number(badge.id) };
  }

  async deleteBadge(id: number) {
    await this.prisma.badge.delete({ where: { id: BigInt(id) } });
    return { ok: true };
  }
}
