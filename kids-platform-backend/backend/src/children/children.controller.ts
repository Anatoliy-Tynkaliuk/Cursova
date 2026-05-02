/**
 * Огляд файлу: `kids-platform-backend/backend/src/children/children.controller.ts`.
 * Призначення: містить частину логіки бекенду/фронтенду платформи навчальних ігор.
 * Взаємодія: імпортує типи, сервіси та компоненти з сусідніх модулів і передає дані через DTO/API props.
 * Терміни: API — контракт обміну даними; DTO — тип вхідних/вихідних даних; Service — бізнес-логіка; Controller/Page — точка входу запитів або UI-екран.
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
