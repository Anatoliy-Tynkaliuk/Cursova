import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../auth/jwt.guard";
import { ChildrenService } from "./children.service";
import { CreateChildDto } from "./dto";

@Controller()
export class ChildrenController {
  constructor(private readonly children: ChildrenService) {}

  // parent/admin: список дітей
  @UseGuards(JwtGuard)
  @Get("children")
  list(@Req() req: any) {
    return this.children.listForUser(req.user);
  }

  // parent/admin: створити дитину
  @UseGuards(JwtGuard)
  @Post("children")
  create(@Req() req: any, @Body() body: CreateChildDto) {
    return this.children.createChild(req.user, body);
  }

  // parent/admin: створити код
  @UseGuards(JwtGuard)
  @Post("children/:id/invite")
  invite(@Req() req: any, @Param("id") id: string) {
    return this.children.createInvite(req.user, Number(id));
  }

  // parent/admin: статистика дитини
  @UseGuards(JwtGuard)
  @Get("children/:id/stats")
  stats(@Req() req: any, @Param("id") id: string) {
    return this.children.getStats(req.user, Number(id));
  }

  // parent/admin: badges дитини
  @UseGuards(JwtGuard)
  @Get("children/:id/badges")
  badges(@Req() req: any, @Param("id") id: string) {
    return this.children.getBadges(req.user, Number(id));
  }
}
