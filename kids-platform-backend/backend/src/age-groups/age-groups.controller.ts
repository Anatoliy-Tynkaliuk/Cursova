import { Controller, Get } from "@nestjs/common";
import { AgeGroupsService } from "./age-groups.service";

@Controller("age-groups")
export class AgeGroupsController {
  constructor(private readonly service: AgeGroupsService) {}

  @Get()
  async getAll() {
    return this.service.findAll();
  }
}
