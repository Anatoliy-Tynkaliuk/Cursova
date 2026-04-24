import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
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

  // child: stats без JWT
  @Get(":id/stats")
  statsForChild(@Param("id") id: string) {
    return this.children.getStatsPublic(Number(id));
  }

  @Get(":id/avatar-shop")
  avatarShop(@Param("id") id: string) {
    return this.children.getAvatarShop(Number(id));
  }

  @Post(":id/avatar-shop/buy")
  buyAvatar(@Param("id") id: string, @Body() body: { avatarId: string }) {
    return this.children.buyAvatar(Number(id), body.avatarId);
  }

  @Patch(":id/avatar")
  setActiveAvatar(@Param("id") id: string, @Body() body: { avatarId: string }) {
    return this.children.setActiveAvatar(Number(id), body.avatarId);
  }
}
