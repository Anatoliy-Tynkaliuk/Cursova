import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateChildDto } from "./dto";
import { ChildrenAccessPolicy } from "./children-access.policy";
import { ChildrenInviteService } from "./children-invite.service";
import { ChildrenStatsService } from "./children-stats.service";
import { AVATAR_CATALOG, ChildrenAvatarService } from "./children-avatar.service";

@Injectable()
export class ChildrenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessPolicy: ChildrenAccessPolicy,
    private readonly inviteService: ChildrenInviteService,
    private readonly statsService: ChildrenStatsService,
    private readonly avatarService: ChildrenAvatarService,
  ) {}

  private userIdFromJwt(user: any) {
    return BigInt(user.sub);
  }

  async listForUser(user: any) {
    const userId = this.userIdFromJwt(user);

    if (user.role === "admin") {
      const all = await this.prisma.childProfile.findMany({
        where: { isActive: true },
        include: { ageGroup: true },
        orderBy: { id: "asc" },
      });
      return all.map((c) => ({ id: Number(c.id), name: c.name, ageGroupCode: c.ageGroup.code, avatar: c.avatar ?? AVATAR_CATALOG[0].image }));
    }

    this.accessPolicy.ensureParentOrAdmin(user);

    const links = await this.prisma.parentChild.findMany({
      where: { parentUserId: userId, child: { isActive: true } },
      include: { child: { include: { ageGroup: true } } },
      orderBy: { createdAt: "asc" },
    });

    return links.map((l) => ({ id: Number(l.child.id), name: l.child.name, ageGroupCode: l.child.ageGroup.code, avatar: l.child.avatar ?? AVATAR_CATALOG[0].image }));
  }

  async createChild(user: any, dto: CreateChildDto) {
    this.accessPolicy.ensureParentOrAdmin(user);

    const age = await this.prisma.ageGroup.findUnique({ where: { code: dto.ageGroupCode } });
    if (!age) throw new BadRequestException("Invalid ageGroupCode");

    const child = await this.prisma.childProfile.create({ data: { name: dto.name.trim(), ageGroupId: age.id } });

    if (user.role === "parent") {
      await this.prisma.parentChild.create({ data: { parentUserId: this.userIdFromJwt(user), childProfileId: child.id } });
    }

    return { id: Number(child.id), name: child.name, ageGroupCode: age.code };
  }

  async createInvite(user: any, childId: number) {
    return this.inviteService.createInvite(user, childId);
  }

  async joinByCode(codeRaw: string) {
    return this.inviteService.joinByCode(codeRaw, this.avatarService.fallbackAvatarImage());
  }

  async getStats(user: any, childId: number) {
    return this.statsService.getStats(user, childId);
  }

  async getStatsPublic(childId: number) {
    return this.getStats({ role: "admin", sub: "0" }, childId);
  }

  async getBadges(user: any, childId: number) {
    return this.statsService.getBadges(user, childId);
  }

  async getAvatarShop(childId: number) {
    const stats = await this.getBadges(null, childId);
    return this.avatarService.getAvatarShop(childId, stats.totalStars);
  }

  async buyAvatar(childId: number, avatarIdRaw: string) {
    const stats = await this.getBadges(null, childId);
    return this.avatarService.buyAvatar(childId, avatarIdRaw, stats.totalStars);
  }

  async setActiveAvatar(childId: number, avatarIdRaw: string) {
    const stats = await this.getBadges(null, childId);
    return this.avatarService.setActiveAvatar(childId, avatarIdRaw, stats.totalStars);
  }

  async deleteChild(user: any, childId: number) {
    this.accessPolicy.ensureParentOrAdmin(user);

    const child = await this.prisma.childProfile.findFirst({ where: { id: BigInt(childId), isActive: true } });
    if (!child || !child.isActive) throw new NotFoundException("Child not found");

    await this.accessPolicy.ensureParentOwnsChild(user, child.id);

    await this.prisma.$transaction([
      this.prisma.childProfile.update({ where: { id: child.id }, data: { isActive: false } }),
      this.prisma.linkInvite.updateMany({ where: { childProfileId: child.id, isRevoked: false }, data: { isRevoked: true } }),
    ]);

    return { ok: true };
  }
}
