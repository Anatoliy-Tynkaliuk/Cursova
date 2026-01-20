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

  // child: вхід по коду (без JWT)
  @Post("child/join")
  join(@Body() body: { code: string }) {
    return this.children.joinByCode(body.code);
  }
}
