/**
 * 📘 ОГЛЯД ФАЙЛУ: `kids-platform-backend/backend/src/children/child-public.controller.ts`.
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


import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ChildrenService } from './children.service';

@Controller('child')
// Клас: ChildPublicController. Об'єднує пов'язану логіку та методи в одному модулі для зрозумілого керування поведінкою.
export class ChildPublicController {
  constructor(private readonly children: ChildrenService) {}

  // child: вхід по коду (без JWT)
  @Post('join')
  // Метод: join. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  join(@Body() body: { code: string }) {
    return this.children.joinByCode(body.code);
  }

  // child: badges без JWT
  @Get(':id/badges')
  // Метод: badgesForChild. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  badgesForChild(@Param('id') id: string) {
    return this.children.getBadges(null, Number(id));
  }

  // child: stats без JWT
  @Get(':id/stats')
  // Метод: statsForChild. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  statsForChild(@Param('id') id: string) {
    return this.children.getStatsPublic(Number(id));
  }

  @Get(':id/avatar-shop')
  // Метод: avatarShop. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  avatarShop(@Param('id') id: string) {
    return this.children.getAvatarShop(Number(id));
  }

  @Post(':id/avatar-shop/buy')
  // Метод: buyAvatar. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  buyAvatar(@Param('id') id: string, @Body() body: { avatarId: string }) {
    return this.children.buyAvatar(Number(id), body.avatarId);
  }

  @Patch(':id/avatar')
  // Метод: setActiveAvatar. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  setActiveAvatar(@Param('id') id: string, @Body() body: { avatarId: string }) {
    return this.children.setActiveAvatar(Number(id), body.avatarId);
  }
}
