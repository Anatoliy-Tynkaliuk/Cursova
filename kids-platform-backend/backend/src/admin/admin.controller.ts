import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { JwtGuard } from "../auth/jwt.guard";
import { AdminGuard } from "../auth/admin.guard";
import type {
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

@Controller("admin")
@UseGuards(JwtGuard, AdminGuard)
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get("age-groups")
  listAgeGroups() {
    return this.service.listAgeGroups();
  }

  @Post("age-groups")
  createAgeGroup(@Body() body: CreateAgeGroupDto) {
    return this.service.createAgeGroup(body);
  }

  @Patch("age-groups/:id")
  updateAgeGroup(@Param("id") id: string, @Body() body: UpdateAgeGroupDto) {
    return this.service.updateAgeGroup(Number(id), body);
  }

  @Delete("age-groups/:id")
  deleteAgeGroup(@Param("id") id: string) {
    return this.service.deleteAgeGroup(Number(id));
  }

  @Get("modules")
  listModules() {
    return this.service.listModules();
  }

  @Post("modules")
  createModule(@Body() body: CreateModuleDto) {
    return this.service.createModule(body);
  }

  @Patch("modules/:id")
  updateModule(@Param("id") id: string, @Body() body: UpdateModuleDto) {
    return this.service.updateModule(Number(id), body);
  }

  @Delete("modules/:id")
  deleteModule(@Param("id") id: string) {
    return this.service.deleteModule(Number(id));
  }

  @Get("game-types")
  listGameTypes() {
    return this.service.listGameTypes();
  }

  @Post("game-types")
  createGameType(@Body() body: CreateGameTypeDto) {
    return this.service.createGameType(body);
  }

  @Patch("game-types/:id")
  updateGameType(@Param("id") id: string, @Body() body: UpdateGameTypeDto) {
    return this.service.updateGameType(Number(id), body);
  }

  @Delete("game-types/:id")
  deleteGameType(@Param("id") id: string) {
    return this.service.deleteGameType(Number(id));
  }

  @Get("games")
  listGames() {
    return this.service.listGames();
  }

  @Post("games")
  createGame(@Body() body: CreateGameDto) {
    return this.service.createGame(body);
  }

  @Patch("games/:id")
  updateGame(@Param("id") id: string, @Body() body: UpdateGameDto) {
    return this.service.updateGame(Number(id), body);
  }

  @Delete("games/:id")
  deleteGame(@Param("id") id: string) {
    return this.service.deleteGame(Number(id));
  }

  @Get("tasks")
  listTasks() {
    return this.service.listTasks();
  }

  @Post("tasks")
  createTask(@Body() body: CreateTaskDto) {
    return this.service.createTask(body);
  }

  @Patch("tasks/:id")
  updateTask(@Param("id") id: string, @Body() body: UpdateTaskDto) {
    return this.service.updateTask(Number(id), body);
  }

  @Delete("tasks/:id")
  deleteTask(@Param("id") id: string) {
    return this.service.deleteTask(Number(id));
  }

  @Get("task-versions")
  listTaskVersions() {
    return this.service.listTaskVersions();
  }

  @Post("task-versions")
  createTaskVersion(@Body() body: CreateTaskVersionDto) {
    return this.service.createTaskVersion(body);
  }

  @Patch("task-versions/:id")
  updateTaskVersion(@Param("id") id: string, @Body() body: UpdateTaskVersionDto) {
    return this.service.updateTaskVersion(Number(id), body);
  }

  @Delete("task-versions/:id")
  deleteTaskVersion(@Param("id") id: string) {
    return this.service.deleteTaskVersion(Number(id));
  }
}
