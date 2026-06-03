import { ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export class ChildrenAccessPolicy {
  constructor(private readonly prisma: PrismaService) {}

  ensureParentOrAdmin(user: { role?: string }) {
    if (user.role !== "parent" && user.role !== "admin") {
      throw new ForbiddenException("Only parent/admin");
    }
  }

  ensureOptionalParentOrAdmin(user: { role?: string } | null | undefined) {
    if (user && user.role !== "parent" && user.role !== "admin") {
      throw new ForbiddenException("Only parent/admin");
    }
  }

  async ensureParentOwnsChild(user: { role?: string; sub?: string }, childProfileId: bigint) {
    if (user.role !== "parent") return;

    if (!user.sub) throw new ForbiddenException("Not your child");

    const link = await this.prisma.parentChild.findUnique({
      where: {
        parentUserId_childProfileId: {
          parentUserId: BigInt(user.sub),
          childProfileId,
        },
      },
    });

    if (!link) throw new ForbiddenException("Not your child");
  }
}
