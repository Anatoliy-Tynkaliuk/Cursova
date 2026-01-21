import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ChildrenService } from "./children.service";

@Controller("child")
export class ChildPublicController {
  constructor(private readonly children: ChildrenService) {}

  // child: вхід по коду (без JWT)
  @Post("join")
  join(@Body() body: { code: string }) {
    return this.children.joinByCode(body.code);
  }

  // child: badges без JWT
  @Get(":id/badges")
  badgesForChild(@Param("id") id: string) {
    return this.children.getBadges(null, Number(id));
  }
}
