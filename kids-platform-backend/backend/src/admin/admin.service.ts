import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateAgeGroupDto,
  CreateGameDto,
  CreateGameTypeDto,
  CreateModuleDto,
  CreateTaskDto,
  CreateTaskVersionDto,
  UpdateAgeGroupDto,
  UpdateGameDto,
  UpdateGameTypeDto,
  UpdateModuleDto,
  UpdateTaskDto,
  UpdateTaskVersionDto,
} from "./dto";

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

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
    const types = await this.prisma.gameType.findMany({ orderBy: { id: "asc" } });
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

  async listTasks() {
    const tasks = await this.prisma.task.findMany({
      orderBy: { id: "asc" },
      include: { game: true },
    });
    return tasks.map((t) => ({
      id: Number(t.id),
      gameId: Number(t.gameId),
      gameTitle: t.game.title,
      position: t.position,
      isActive: t.isActive,
    }));
  }

  async createTask(dto: CreateTaskDto) {
    const task = await this.prisma.task.create({
      data: {
        gameId: BigInt(dto.gameId),
        position: dto.position,
        isActive: dto.isActive ?? true,
      },
    });
    return { id: Number(task.id) };
  }

  async updateTask(id: number, dto: UpdateTaskDto) {
    const task = await this.prisma.task.update({
      where: { id: BigInt(id) },
      data: {
        gameId: dto.gameId ? BigInt(dto.gameId) : undefined,
        position: dto.position,
        isActive: dto.isActive,
      },
    });
    return { id: Number(task.id) };
  }

  async deleteTask(id: number) {
    await this.prisma.task.delete({ where: { id: BigInt(id) } });
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

  async deleteTaskVersion(id: number) {
    await this.prisma.taskVersion.delete({ where: { id: BigInt(id) } });
    return { ok: true };
  }
}
