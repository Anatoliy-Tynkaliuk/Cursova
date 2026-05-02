/**
 * ФАЙЛ: `src/children/children.controller.ts`.
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
// ChildrenController: клас, що інкапсулює відповідальність цього файлу та координує роботу методів.
export class ChildrenController {
  constructor(private readonly children: ChildrenService) {}

  // parent/admin: список дітей
  @UseGuards(JwtGuard)
  @Get('children')
  list(@Req() req: any) {
    return this.children.listForUser(req.user);
  }

  // parent/admin: створити дитину
  @UseGuards(JwtGuard)
  @Post('children')
  create(@Req() req: any, @Body() body: CreateChildDto) {
    return this.children.createChild(req.user, body);
  }

  // parent/admin: створити код
  @UseGuards(JwtGuard)
  @Post('children/:id/invite')
  invite(@Req() req: any, @Param('id') id: string) {
    return this.children.createInvite(req.user, Number(id));
  }

  // parent/admin: статистика дитини
  @UseGuards(JwtGuard)
  @Get('children/:id/stats')
  stats(@Req() req: any, @Param('id') id: string) {
    return this.children.getStats(req.user, Number(id));
  }

  // parent/admin: badges дитини
  @UseGuards(JwtGuard)
  @Get('children/:id/badges')
  badges(@Req() req: any, @Param('id') id: string) {
    return this.children.getBadges(req.user, Number(id));
  }

  // parent/admin: видалити дитину
  @UseGuards(JwtGuard)
  @Delete('children/:id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.children.deleteChild(req.user, Number(id));
  }
}
