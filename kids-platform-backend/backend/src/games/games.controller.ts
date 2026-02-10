import { Controller, Get, Param, Query } from "@nestjs/common";
import { GamesService } from "./games.service";

@Controller("games")
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  list(@Query("ageGroupCode") ageGroupCode?: string) {
    return this.gamesService.list(ageGroupCode);
  }

  @Get(":gameId/levels")
  levels(
    @Param("gameId") gameId: string,
    @Query("difficulty") difficulty: string,
    @Query("childProfileId") childProfileId?: string,
  ) {
    return this.gamesService.levels(Number(gameId), Number(difficulty), childProfileId ? Number(childProfileId) : undefined);
  }
}
