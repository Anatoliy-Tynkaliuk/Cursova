import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ChildrenAccessPolicy } from "./children-access.policy";

function randomCode(len = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

@Injectable()
export class ChildrenInviteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessPolicy: ChildrenAccessPolicy,
  ) {}

  async createInvite(user: any, childId: number) {
    this.accessPolicy.ensureParentOrAdmin(user);

    const child = await this.prisma.childProfile.findFirst({
      where: { id: BigInt(childId), isActive: true },
      include: { ageGroup: true },
    });
    if (!child || !child.isActive) throw new NotFoundException("Child not found");

    await this.accessPolicy.ensureParentOwnsChild(user, child.id);

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    let code = randomCode(6);
    for (let i = 0; i < 5; i++) {
      const exists = await this.prisma.linkInvite.findUnique({ where: { code } });
      if (!exists) break;
      code = randomCode(6);
    }

    const invite = await this.prisma.linkInvite.create({
      data: { childProfileId: child.id, code, expiresAt, isRevoked: false },
    });

    return {
      code: invite.code,
      expiresAt: invite.expiresAt,
      child: { id: Number(child.id), name: child.name, ageGroupCode: child.ageGroup.code },
    };
  }

  async joinByCode(codeRaw: string, fallbackAvatar: string) {
    const code = codeRaw.trim().toUpperCase();

    const invite = await this.prisma.linkInvite.findUnique({
      where: { code },
      include: { child: { include: { ageGroup: true } } },
    });

    if (!invite) throw new NotFoundException("Code not found");
    if (!invite.child.isActive) throw new BadRequestException("Child profile is inactive");
    if (invite.isRevoked) throw new BadRequestException("Code revoked");
    if (invite.expiresAt.getTime() < Date.now()) throw new BadRequestException("Code expired");

    await this.prisma.linkInvite.update({ where: { code }, data: { lastUsedAt: new Date() } });

    return {
      childProfileId: Number(invite.child.id),
      childName: invite.child.name,
      ageGroupCode: invite.child.ageGroup.code,
      avatar: invite.child.avatar ?? fallbackAvatar,
    };
  }
}
