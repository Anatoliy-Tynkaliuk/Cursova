/**
 * ФАЙЛ: `src/children/child-public.controller.ts`.
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


import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ChildrenService } from './children.service';

@Controller('child')
// ChildPublicController: клас, що інкапсулює відповідальність цього файлу та координує роботу методів.
export class ChildPublicController {
  constructor(private readonly children: ChildrenService) {}

  // child: вхід по коду (без JWT)
  @Post('join')
  join(@Body() body: { code: string }) {
    return this.children.joinByCode(body.code);
  }

  // child: badges без JWT
  @Get(':id/badges')
  badgesForChild(@Param('id') id: string) {
    return this.children.getBadges(null, Number(id));
  }

  // child: stats без JWT
  @Get(':id/stats')
  statsForChild(@Param('id') id: string) {
    return this.children.getStatsPublic(Number(id));
  }

  @Get(':id/avatar-shop')
  avatarShop(@Param('id') id: string) {
    return this.children.getAvatarShop(Number(id));
  }

  @Post(':id/avatar-shop/buy')
  buyAvatar(@Param('id') id: string, @Body() body: { avatarId: string }) {
    return this.children.buyAvatar(Number(id), body.avatarId);
  }

  @Patch(':id/avatar')
  setActiveAvatar(@Param('id') id: string, @Body() body: { avatarId: string }) {
    return this.children.setActiveAvatar(Number(id), body.avatarId);
  }
}
