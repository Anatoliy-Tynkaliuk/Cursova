/**
 * ФАЙЛ: `src/admin/admin.service.ts`.
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


import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
} from './dto';

@Injectable()
// AdminService: клас, що інкапсулює відповідальність цього файлу та координує роботу методів.
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // Метод `listAgeGroups(без параметрів)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async listAgeGroups() {
    const groups = await this.prisma.ageGroup.findMany({
      orderBy: { id: 'asc' },
    });
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

  // Метод `createAgeGroup(dto: CreateAgeGroupDto)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
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

  // Метод `updateAgeGroup(id: number, dto: UpdateAgeGroupDto)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
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

  // Метод `deleteAgeGroup(id: number)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async deleteAgeGroup(id: number) {
    await this.prisma.ageGroup.update({
      where: { id: BigInt(id) },
      data: { isActive: false },
    });
    return { ok: true };
  }

  // Метод `listModules(без параметрів)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async listModules() {
    const modules = await this.prisma.module.findMany({
      orderBy: { id: 'asc' },
    });
    return modules.map((m) => ({
      id: Number(m.id),
      code: m.code,
      title: m.title,
      description: m.description,
      icon: m.icon,
      isActive: m.isActive,
    }));
  }

  // Метод `createModule(dto: CreateModuleDto)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async createModule(dto: CreateModuleDto) {
    const module = await this.prisma.module.create({
      data: {
        code: dto.code,
        title: dto.title,
        description: dto.description,
        isActive: dto.isActive ?? true,
      },
    });
    return { id: Number(module.id) };
  }

  // Метод `updateModule(id: number, dto: UpdateModuleDto)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async updateModule(id: number, dto: UpdateModuleDto) {
    const module = await this.prisma.module.update({
      where: { id: BigInt(id) },
      data: {
        code: dto.code,
        title: dto.title,
        description: dto.description,
        isActive: dto.isActive,
      },
    });
    return { id: Number(module.id) };
  }

  // Метод `deleteModule(id: number)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async deleteModule(id: number) {
    await this.prisma.module.update({
      where: { id: BigInt(id) },
      data: { isActive: false },
    });
    return { ok: true };
  }

  // Метод `listGameTypes(без параметрів)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async listGameTypes() {
    const types = await this.prisma.gameType.findMany({
      orderBy: { id: 'asc' },
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

  // Метод `createGameType(dto: CreateGameTypeDto)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async createGameType(dto: CreateGameTypeDto) {
    const type = await this.prisma.gameType.create({
      data: {
        code: dto.code,
        title: dto.title,
        description: dto.description,
        isActive: dto.isActive ?? true,
      },
    });
    return { id: Number(type.id) };
  }

  // Метод `updateGameType(id: number, dto: UpdateGameTypeDto)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async updateGameType(id: number, dto: UpdateGameTypeDto) {
    const type = await this.prisma.gameType.update({
      where: { id: BigInt(id) },
      data: {
        code: dto.code,
        title: dto.title,
        description: dto.description,
        isActive: dto.isActive,
      },
    });
    return { id: Number(type.id) };
  }

  // Метод `deleteGameType(id: number)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async deleteGameType(id: number) {
    await this.prisma.gameType.update({
      where: { id: BigInt(id) },
      data: { isActive: false },
    });
    return { ok: true };
  }

  // Метод `listGames(без параметрів)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async listGames() {
    const games = await this.prisma.game.findMany({
      orderBy: { id: 'asc' },
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

  // Метод `createGame(dto: CreateGameDto)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async createGame(dto: CreateGameDto) {
    const game = await this.prisma.game.create({
      data: {
        moduleId: BigInt(dto.moduleId),
        gameTypeId: BigInt(dto.gameTypeId),
        minAgeGroupId: BigInt(dto.minAgeGroupId),
        title: dto.title,
        description: dto.description,
        difficulty: dto.difficulty ?? 1,
        isActive: dto.isActive ?? true,
      },
    });
    return { id: Number(game.id) };
  }

  // Метод `updateGame(id: number, dto: UpdateGameDto)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async updateGame(id: number, dto: UpdateGameDto) {
    const game = await this.prisma.game.update({
      where: { id: BigInt(id) },
      data: {
        moduleId: dto.moduleId ? BigInt(dto.moduleId) : undefined,
        gameTypeId: dto.gameTypeId ? BigInt(dto.gameTypeId) : undefined,
        minAgeGroupId: dto.minAgeGroupId
          ? BigInt(dto.minAgeGroupId)
          : undefined,
        title: dto.title,
        description: dto.description,
        difficulty: dto.difficulty,
        isActive: dto.isActive,
      },
    });
    return { id: Number(game.id) };
  }

  // Метод `deleteGame(id: number)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async deleteGame(id: number) {
    await this.prisma.game.update({
      where: { id: BigInt(id) },
      data: { isActive: false },
    });
    return { ok: true };
  }

  // Метод `listGameLevels(gameId?: number)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async listGameLevels(gameId?: number) {
    const levels = await this.prisma.gameLevel.findMany({
      where: {
        ...(gameId ? { gameId: BigInt(gameId) } : {}),
      },
      include: { game: true },
      orderBy: [
        { gameId: 'asc' },
        { difficulty: 'asc' },
        { levelNumber: 'asc' },
      ],
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

  // Метод `createGameLevel(dto: CreateGameLevelDto)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async createGameLevel(dto: CreateGameLevelDto) {
    if (![1, 2, 3].includes(dto.difficulty)) {
      throw new BadRequestException('difficulty must be one of 1, 2, 3');
    }

    const level = await this.prisma.$transaction(async (tx) => {
      let levelNumber = dto.levelNumber;

  // Метод `if(!levelNumber)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
      if (!levelNumber) {
        const maxLevel = await tx.gameLevel.aggregate({
          where: {
            gameId: BigInt(dto.gameId),
            difficulty: dto.difficulty,
            deletedAt: null,
          },
          _max: { levelNumber: true },
        });
        levelNumber = (maxLevel._max.levelNumber ?? 0) + 1;
      }

      return tx.gameLevel.create({
        data: {
          gameId: BigInt(dto.gameId),
          difficulty: dto.difficulty,
          levelNumber,
          title: dto.title,
          isActive: dto.isActive ?? true,
        },
      });
    });

    return { id: Number(level.id) };
  }

  // Метод `updateGameLevel(id: number, dto: UpdateGameLevelDto)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async updateGameLevel(id: number, dto: UpdateGameLevelDto) {
    const level = await this.prisma.gameLevel.update({
      where: { id: BigInt(id) },
      data: {
        title: dto.title,
        levelNumber: dto.levelNumber,
        isActive: dto.isActive,
        deletedAt:
          dto.isActive === true
            ? null
            : dto.isActive === false
              ? new Date()
              : undefined,
      },
    });
    return { id: Number(level.id) };
  }

  // Метод `deleteGameLevel(id: number)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async deleteGameLevel(id: number) {
    await this.prisma.gameLevel.update({
      where: { id: BigInt(id) },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
    return { ok: true };
  }

  // Метод `listTasks(без параметрів)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async listTasks() {
    const tasks = await this.prisma.task.findMany({
      orderBy: { id: 'asc' },
      include: { game: true },
    });

    const levelIds = Array.from(
      new Set(
        tasks
          .filter((task) => task.levelId !== null)
          .map((task) => task.levelId!.toString()),
      ),
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

    const levelById = new Map(
      levels.map((level) => [level.id.toString(), level]),
    );

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

  // Метод `createTask(dto: CreateTaskDto)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async createTask(dto: CreateTaskDto) {
    const task = await this.prisma.task.create({
      data: {
        gameId: BigInt(dto.gameId),
        levelId: dto.levelId ? BigInt(dto.levelId) : undefined,
        position: dto.position,
        isActive: dto.isActive ?? true,
      },
    });
    return { id: Number(task.id) };
  }

  // Метод `updateTask(id: number, dto: UpdateTaskDto)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async updateTask(id: number, dto: UpdateTaskDto) {
    const task = await this.prisma.task.update({
      where: { id: BigInt(id) },
      data: {
        gameId: dto.gameId ? BigInt(dto.gameId) : undefined,
        levelId: dto.levelId ? BigInt(dto.levelId) : undefined,
        position: dto.position,
        isActive: dto.isActive,
      },
    });
    return { id: Number(task.id) };
  }

  // Метод `deleteTask(id: number)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async deleteTask(id: number) {
    await this.prisma.task.update({
      where: { id: BigInt(id) },
      data: { isActive: false },
    });
    return { ok: true };
  }

  // Метод `listTaskVersions(без параметрів)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async listTaskVersions() {
    const versions = await this.prisma.taskVersion.findMany({
      orderBy: { id: 'asc' },
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

  // Метод `createTaskVersion(dto: CreateTaskVersionDto)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async createTaskVersion(dto: CreateTaskVersionDto) {
    const version = await this.prisma.taskVersion.create({
      data: {
        taskId: BigInt(dto.taskId),
        version: dto.version,
        prompt: dto.prompt,
        dataJson: dto.dataJson ?? {},
        correctJson: dto.correctJson,
        explanation: dto.explanation,
        difficulty: dto.difficulty ?? 1,
        isCurrent: dto.isCurrent ?? false,
      },
    });
    return { id: Number(version.id) };
  }

  // Метод `updateTaskVersion(id: number, dto: UpdateTaskVersionDto)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async updateTaskVersion(id: number, dto: UpdateTaskVersionDto) {
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

  // Метод `deleteTaskVersion(id: number)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async deleteTaskVersion(id: number) {
    await this.prisma.taskVersion.delete({
      where: { id: BigInt(id) },
    });
    return { ok: true };
  }

  // Метод `listBadges(без параметрів)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async listBadges() {
    const badges = await this.prisma.badge.findMany({ orderBy: { id: 'asc' } });
    return badges.map((b) => ({
      id: Number(b.id),
      code: b.code,
      title: b.title,
      description: b.description,
    }));
  }

  // Метод `createBadge(dto: CreateBadgeDto)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async createBadge(dto: CreateBadgeDto) {
    const badge = await this.prisma.badge.create({
      data: {
        code: dto.code,
        title: dto.title,
        description: dto.description,
      },
    });
    return { id: Number(badge.id) };
  }

  // Метод `updateBadge(id: number, dto: UpdateBadgeDto)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async updateBadge(id: number, dto: UpdateBadgeDto) {
    const badge = await this.prisma.badge.update({
      where: { id: BigInt(id) },
      data: {
        code: dto.code,
        title: dto.title,
        description: dto.description,
      },
    });
    return { id: Number(badge.id) };
  }

  // Метод `deleteBadge(id: number)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async deleteBadge(id: number) {
    await this.prisma.badge.delete({ where: { id: BigInt(id) } });
    return { ok: true };
  }
}
