import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AgeGroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.ageGroup.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }
}
