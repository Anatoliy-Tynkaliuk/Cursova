/**
 * 📘 ОГЛЯД ФАЙЛУ: `kids-platform-backend/backend/src/admin/admin.controller.ts`.
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


import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtGuard } from '../auth/jwt.guard';
import { AdminGuard } from '../auth/admin.guard';
import type {
  CreateAgeGroupDto,
  CreateGameDto,
  CreateGameTypeDto,
  CreateBadgeDto,
  CreateModuleDto,
  CreateTaskDto,
  CreateTaskVersionDto,
  UpdateAgeGroupDto,
  UpdateGameDto,
  UpdateGameTypeDto,
  UpdateBadgeDto,
  UpdateModuleDto,
  UpdateTaskDto,
  UpdateTaskVersionDto,
  CreateGameLevelDto,
  UpdateGameLevelDto,
} from './dto';

@Controller('admin')
@UseGuards(JwtGuard, AdminGuard)
// Клас: AdminController. Об'єднує пов'язану логіку та методи в одному модулі для зрозумілого керування поведінкою.
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('age-groups')
  // Метод: listAgeGroups. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  listAgeGroups() {
    return this.service.listAgeGroups();
  }

  @Post('age-groups')
  // Метод: createAgeGroup. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  createAgeGroup(@Body() body: CreateAgeGroupDto) {
    return this.service.createAgeGroup(body);
  }

  @Patch('age-groups/:id')
  // Метод: updateAgeGroup. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  updateAgeGroup(@Param('id') id: string, @Body() body: UpdateAgeGroupDto) {
    return this.service.updateAgeGroup(Number(id), body);
  }

  @Delete('age-groups/:id')
  // Метод: deleteAgeGroup. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  deleteAgeGroup(@Param('id') id: string) {
    return this.service.deleteAgeGroup(Number(id));
  }

  @Get('modules')
  // Метод: listModules. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  listModules() {
    return this.service.listModules();
  }

  @Post('modules')
  // Метод: createModule. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  createModule(@Body() body: CreateModuleDto) {
    return this.service.createModule(body);
  }

  @Patch('modules/:id')
  // Метод: updateModule. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  updateModule(@Param('id') id: string, @Body() body: UpdateModuleDto) {
    return this.service.updateModule(Number(id), body);
  }

  @Delete('modules/:id')
  // Метод: deleteModule. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  deleteModule(@Param('id') id: string) {
    return this.service.deleteModule(Number(id));
  }

  @Get('game-types')
  // Метод: listGameTypes. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  listGameTypes() {
    return this.service.listGameTypes();
  }

  @Post('game-types')
  // Метод: createGameType. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  createGameType(@Body() body: CreateGameTypeDto) {
    return this.service.createGameType(body);
  }

  @Patch('game-types/:id')
  // Метод: updateGameType. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  updateGameType(@Param('id') id: string, @Body() body: UpdateGameTypeDto) {
    return this.service.updateGameType(Number(id), body);
  }

  @Delete('game-types/:id')
  // Метод: deleteGameType. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  deleteGameType(@Param('id') id: string) {
    return this.service.deleteGameType(Number(id));
  }

  @Get('games')
  // Метод: listGames. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  listGames() {
    return this.service.listGames();
  }

  @Post('games')
  // Метод: createGame. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  createGame(@Body() body: CreateGameDto) {
    return this.service.createGame(body);
  }

  @Patch('games/:id')
  // Метод: updateGame. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  updateGame(@Param('id') id: string, @Body() body: UpdateGameDto) {
    return this.service.updateGame(Number(id), body);
  }

  @Delete('games/:id')
  // Метод: deleteGame. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  deleteGame(@Param('id') id: string) {
    return this.service.deleteGame(Number(id));
  }

  @Get('game-levels')
  // Метод: listGameLevels. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  listGameLevels(@Query('gameId') gameId?: string) {
    return this.service.listGameLevels(gameId ? Number(gameId) : undefined);
  }

  @Post('game-levels')
  // Метод: createGameLevel. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  createGameLevel(@Body() body: CreateGameLevelDto) {
    return this.service.createGameLevel(body);
  }

  @Patch('game-levels/:id')
  // Метод: updateGameLevel. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  updateGameLevel(@Param('id') id: string, @Body() body: UpdateGameLevelDto) {
    return this.service.updateGameLevel(Number(id), body);
  }

  @Delete('game-levels/:id')
  // Метод: deleteGameLevel. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  deleteGameLevel(@Param('id') id: string) {
    return this.service.deleteGameLevel(Number(id));
  }

  @Get('tasks')
  // Метод: listTasks. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  listTasks() {
    return this.service.listTasks();
  }

  @Post('tasks')
  // Метод: createTask. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  createTask(@Body() body: CreateTaskDto) {
    return this.service.createTask(body);
  }

  @Patch('tasks/:id')
  // Метод: updateTask. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  updateTask(@Param('id') id: string, @Body() body: UpdateTaskDto) {
    return this.service.updateTask(Number(id), body);
  }

  @Delete('tasks/:id')
  // Метод: deleteTask. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  deleteTask(@Param('id') id: string) {
    return this.service.deleteTask(Number(id));
  }

  @Get('task-versions')
  // Метод: listTaskVersions. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  listTaskVersions() {
    return this.service.listTaskVersions();
  }

  @Post('task-versions')
  // Метод: createTaskVersion. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  createTaskVersion(@Body() body: CreateTaskVersionDto) {
    return this.service.createTaskVersion(body);
  }

  @Patch('task-versions/:id')
  updateTaskVersion(
    @Param('id') id: string,
    @Body() body: UpdateTaskVersionDto,
  ) {
    return this.service.updateTaskVersion(Number(id), body);
  }

  @Delete('task-versions/:id')
  // Метод: deleteTaskVersion. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  deleteTaskVersion(@Param('id') id: string) {
    return this.service.deleteTaskVersion(Number(id));
  }

  @Get('badges')
  // Метод: listBadges. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  listBadges() {
    return this.service.listBadges();
  }

  @Post('badges')
  // Метод: createBadge. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  createBadge(@Body() body: CreateBadgeDto) {
    return this.service.createBadge(body);
  }

  @Patch('badges/:id')
  // Метод: updateBadge. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  updateBadge(@Param('id') id: string, @Body() body: UpdateBadgeDto) {
    return this.service.updateBadge(Number(id), body);
  }

  @Delete('badges/:id')
  // Метод: deleteBadge. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  deleteBadge(@Param('id') id: string) {
    return this.service.deleteBadge(Number(id));
  }
}
