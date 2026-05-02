/**
 * 📘 ОГЛЯД ФАЙЛУ: `kids-platform-backend/backend/src/children/children.controller.ts`.
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
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { ChildrenService } from './children.service';
import { CreateChildDto } from './dto';

@Controller()
// Клас: ChildrenController. Об'єднує пов'язану логіку та методи в одному модулі для зрозумілого керування поведінкою.
export class ChildrenController {
  constructor(private readonly children: ChildrenService) {}

  // parent/admin: список дітей
  @UseGuards(JwtGuard)
  @Get('children')
  // Метод: list. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  list(@Req() req: any) {
    return this.children.listForUser(req.user);
  }

  // parent/admin: створити дитину
  @UseGuards(JwtGuard)
  @Post('children')
  // Метод: create. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  create(@Req() req: any, @Body() body: CreateChildDto) {
    return this.children.createChild(req.user, body);
  }

  // parent/admin: створити код
  @UseGuards(JwtGuard)
  @Post('children/:id/invite')
  // Метод: invite. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  invite(@Req() req: any, @Param('id') id: string) {
    return this.children.createInvite(req.user, Number(id));
  }

  // parent/admin: статистика дитини
  @UseGuards(JwtGuard)
  @Get('children/:id/stats')
  // Метод: stats. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  stats(@Req() req: any, @Param('id') id: string) {
    return this.children.getStats(req.user, Number(id));
  }

  // parent/admin: badges дитини
  @UseGuards(JwtGuard)
  @Get('children/:id/badges')
  // Метод: badges. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  badges(@Req() req: any, @Param('id') id: string) {
    return this.children.getBadges(req.user, Number(id));
  }

  // parent/admin: видалити дитину
  @UseGuards(JwtGuard)
  @Delete('children/:id')
  // Метод: remove. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  remove(@Req() req: any, @Param('id') id: string) {
    return this.children.deleteChild(req.user, Number(id));
  }
}
