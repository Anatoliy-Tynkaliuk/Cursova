import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
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

  // child: activity + progress without JWT (child session)
  @Get(":id/stats")
  statsForChild(@Param("id") id: string) {
    return this.children.getStatsPublic(Number(id));
  }

  // child: calendar activity + time analytics
  @Get(":id/activity")
  activityForChild(@Param("id") id: string, @Query("month") month?: string) {
    return this.children.getActivityPublic(Number(id), month);
  }
}
