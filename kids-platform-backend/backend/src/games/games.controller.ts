import { Controller, Get, Query } from "@nestjs/common";
import { GamesService } from "./games.service";

@Controller("games")
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  list(@Query("ageGroupCode") ageGroupCode?: string) {
    return this.gamesService.list(ageGroupCode);
  }
}
