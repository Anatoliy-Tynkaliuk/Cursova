/**
 * 📘 ОГЛЯД ФАЙЛУ: `kids-platform-backend/backend/src/admin/admin.service.ts`.
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
// Клас: AdminService. Об'єднує пов'язану логіку та методи в одному модулі для зрозумілого керування поведінкою.
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // Метод: listAgeGroups. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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

  // Метод: createAgeGroup. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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

  // Метод: updateAgeGroup. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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

  // Метод: deleteAgeGroup. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  async deleteAgeGroup(id: number) {
    await this.prisma.ageGroup.update({
      where: { id: BigInt(id) },
      data: { isActive: false },
    });
    return { ok: true };
  }

  // Метод: listModules. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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

  // Метод: createModule. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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

  // Метод: updateModule. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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

  // Метод: deleteModule. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  async deleteModule(id: number) {
    await this.prisma.module.update({
      where: { id: BigInt(id) },
      data: { isActive: false },
    });
    return { ok: true };
  }

  // Метод: listGameTypes. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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

  // Метод: createGameType. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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

  // Метод: updateGameType. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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

  // Метод: deleteGameType. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  async deleteGameType(id: number) {
    await this.prisma.gameType.update({
      where: { id: BigInt(id) },
      data: { isActive: false },
    });
    return { ok: true };
  }

  // Метод: listGames. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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

  // Метод: createGame. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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

  // Метод: updateGame. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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

  // Метод: deleteGame. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  async deleteGame(id: number) {
    await this.prisma.game.update({
      where: { id: BigInt(id) },
      data: { isActive: false },
    });
    return { ok: true };
  }

  // Метод: listGameLevels. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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

  // Метод: createGameLevel. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  async createGameLevel(dto: CreateGameLevelDto) {
  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
    if (![1, 2, 3].includes(dto.difficulty)) {
      throw new BadRequestException('difficulty must be one of 1, 2, 3');
    }

    const level = await this.prisma.$transaction(async (tx) => {
      let levelNumber = dto.levelNumber;

  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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

  // Метод: updateGameLevel. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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

  // Метод: deleteGameLevel. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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

  // Метод: listTasks. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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

  // Метод: createTask. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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

  // Метод: updateTask. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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

  // Метод: deleteTask. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  async deleteTask(id: number) {
    await this.prisma.task.update({
      where: { id: BigInt(id) },
      data: { isActive: false },
    });
    return { ok: true };
  }

  // Метод: listTaskVersions. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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

  // Метод: createTaskVersion. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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

  // Метод: updateTaskVersion. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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

  // Метод: deleteTaskVersion. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  async deleteTaskVersion(id: number) {
    await this.prisma.taskVersion.delete({
      where: { id: BigInt(id) },
    });
    return { ok: true };
  }

  // Метод: listBadges. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  async listBadges() {
    const badges = await this.prisma.badge.findMany({ orderBy: { id: 'asc' } });
    return badges.map((b) => ({
      id: Number(b.id),
      code: b.code,
      title: b.title,
      description: b.description,
    }));
  }

  // Метод: createBadge. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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

  // Метод: updateBadge. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
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

  // Метод: deleteBadge. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  async deleteBadge(id: number) {
    await this.prisma.badge.delete({ where: { id: BigInt(id) } });
    return { ok: true };
  }
}
