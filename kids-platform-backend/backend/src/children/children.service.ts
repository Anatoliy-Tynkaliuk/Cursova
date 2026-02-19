import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateChildDto } from "./dto";
import { buildAchievementRule, type AchievementMetrics } from "./achievement-rules";
import { calculateAchievementMetrics } from "./achievement-metrics";

function randomCode(len = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

@Injectable()
export class ChildrenService {
  constructor(private prisma: PrismaService) {}

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
      return all.map((c) => ({ id: Number(c.id), name: c.name, ageGroupCode: c.ageGroup.code }));
    }

    if (user.role !== "parent") throw new ForbiddenException("Only parent/admin");

    const links = await this.prisma.parentChild.findMany({
      where: {
        parentUserId: userId,
        child: { isActive: true },
      },
      include: { child: { include: { ageGroup: true } } },
      orderBy: { createdAt: "asc" },
    });

    return links.map((l) => ({
      id: Number(l.child.id),
      name: l.child.name,
      ageGroupCode: l.child.ageGroup.code,
    }));
  }

  async createChild(user: any, dto: CreateChildDto) {
    if (user.role !== "parent" && user.role !== "admin") throw new ForbiddenException("Only parent/admin");

    const age = await this.prisma.ageGroup.findUnique({ where: { code: dto.ageGroupCode } });
    if (!age) throw new BadRequestException("Invalid ageGroupCode");

    const child = await this.prisma.childProfile.create({
      data: {
        name: dto.name.trim(),
        ageGroupId: age.id,
      },
    });

    // якщо parent — одразу зв’язуємо
    if (user.role === "parent") {
      await this.prisma.parentChild.create({
        data: { parentUserId: this.userIdFromJwt(user), childProfileId: child.id },
      });
    }

    return { id: Number(child.id), name: child.name, ageGroupCode: age.code };
  }

  async createInvite(user: any, childId: number) {
    if (user.role !== "parent" && user.role !== "admin") throw new ForbiddenException("Only parent/admin");

    const child = await this.prisma.childProfile.findFirst({
      where: { id: BigInt(childId), isActive: true },
      include: { ageGroup: true },
    });
    if (!child || !child.isActive) throw new NotFoundException("Child not found");

    // parent може робити invite тільки для своєї дитини
    if (user.role === "parent") {
      const link = await this.prisma.parentChild.findUnique({
        where: { parentUserId_childProfileId: { parentUserId: this.userIdFromJwt(user), childProfileId: child.id } },
      });
      if (!link) throw new ForbiddenException("Not your child");
    }

    // робимо код на 30 днів
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // генеруємо унікальний code
    let code = randomCode(6);
    for (let i = 0; i < 5; i++) {
      const exists = await this.prisma.linkInvite.findUnique({ where: { code } });
      if (!exists) break;
      code = randomCode(6);
    }

    const invite = await this.prisma.linkInvite.create({
      data: {
        childProfileId: child.id,
        code,
        expiresAt,
        isRevoked: false,
      },
    });

    return {
      code: invite.code,
      expiresAt: invite.expiresAt,
      child: { id: Number(child.id), name: child.name, ageGroupCode: child.ageGroup.code },
    };
  }

  async joinByCode(codeRaw: string) {
    const code = codeRaw.trim().toUpperCase();

    const invite = await this.prisma.linkInvite.findUnique({
      where: { code },
      include: { child: { include: { ageGroup: true } } },
    });

    if (!invite) throw new NotFoundException("Code not found");
    if (!invite.child.isActive) throw new BadRequestException("Child profile is inactive");
    if (invite.isRevoked) throw new BadRequestException("Code revoked");
    if (invite.expiresAt.getTime() < Date.now()) throw new BadRequestException("Code expired");

    await this.prisma.linkInvite.update({
      where: { code },
      data: { lastUsedAt: new Date() },
    });

    return {
      childProfileId: Number(invite.child.id),
      childName: invite.child.name,
      ageGroupCode: invite.child.ageGroup.code,
    };
  }

  async getStats(user: any, childId: number) {
    if (user.role !== "parent" && user.role !== "admin") throw new ForbiddenException("Only parent/admin");

    const child = await this.prisma.childProfile.findFirst({
      where: { id: BigInt(childId), isActive: true },
      include: { ageGroup: true },
    });
    if (!child || !child.isActive) throw new NotFoundException("Child not found");

    if (user.role === "parent") {
      const link = await this.prisma.parentChild.findUnique({
        where: { parentUserId_childProfileId: { parentUserId: this.userIdFromJwt(user), childProfileId: child.id } },
      });
      if (!link) throw new ForbiddenException("Not your child");
    }

    const attempts = await this.prisma.attempt.findMany({
      where: { childProfileId: child.id },
      include: { game: { include: { module: true, gameType: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const totalAttempts = attempts.length;
    const finishedAttempts = attempts.filter((a) => a.isFinished).length;
    const totalScore = attempts.reduce((acc, a) => acc + a.score, 0);
    const totalCorrect = attempts.reduce((acc, a) => acc + a.correctCount, 0);
    const totalQuestions = attempts.reduce((acc, a) => acc + a.totalCount, 0);

    return {
      child: {
        id: Number(child.id),
        name: child.name,
        ageGroupCode: child.ageGroup.code,
      },
      summary: {
        totalAttempts,
        finishedAttempts,
        totalScore,
        totalCorrect,
        totalQuestions,
      },
      attempts: attempts.map((a) => ({
        id: Number(a.id),
        game: {
          id: Number(a.game.id),
          title: a.game.title,
          moduleCode: a.game.module.code,
        },
        score: a.score,
        correctCount: a.correctCount,
        totalCount: a.totalCount,
        isFinished: a.isFinished,
        createdAt: a.createdAt,
        finishedAt: a.finishedAt,
      })),
    };
  }

  async getBadges(user: any, childId: number) {
    if (user && user.role !== "parent" && user.role !== "admin") {
      throw new ForbiddenException("Only parent/admin");
    }

    const child = await this.prisma.childProfile.findFirst({
      where: { id: BigInt(childId), isActive: true },
    });
    if (!child || !child.isActive) throw new NotFoundException("Child not found");

    if (user?.role === "parent") {
      const link = await this.prisma.parentChild.findUnique({
        where: { parentUserId_childProfileId: { parentUserId: this.userIdFromJwt(user), childProfileId: child.id } },
      });
      if (!link) throw new ForbiddenException("Not your child");
    }

    const [allAttempts, badges] = await Promise.all([
      this.prisma.attempt.findMany({
        where: { childProfileId: child.id },
        select: {
          createdAt: true,
          isFinished: true,
          correctCount: true,
          totalCount: true,
          score: true,
          levelId: true,
        },
      }),
      this.prisma.badge.findMany({ orderBy: { id: "asc" } }),
    ]);

    const metrics: AchievementMetrics = calculateAchievementMetrics(allAttempts);


    return {
      finishedAttempts: metrics.finishedAttempts,
      totalStars: metrics.totalStars,
      loginDays: metrics.loginDays,
      totalAttempts: metrics.totalAttempts,
      correctAnswers: metrics.correctAnswers,
      perfectGames: metrics.perfectGames,
      badges: badges.map((badge) => {
        const rule = buildAchievementRule(badge.code, metrics);
        return {
          id: Number(badge.id),
          code: badge.code,
          title: badge.title,
          description: badge.description,
          isEarned: rule ? rule.currentValue >= rule.targetValue : false,
          metricKey: rule?.metricKey ?? null,
          metricLabel: rule?.metricLabel ?? null,
          currentValue: rule?.currentValue ?? null,
          targetValue: rule?.targetValue ?? null,
          progressPercent: rule?.progressPercent ?? null,
        };
      }),
    };
  }

  async deleteChild(user: any, childId: number) {
    if (user.role !== "parent" && user.role !== "admin") {
      throw new ForbiddenException("Only parent/admin");
    }

    const child = await this.prisma.childProfile.findFirst({
      where: { id: BigInt(childId), isActive: true },
    });
    if (!child || !child.isActive) throw new NotFoundException("Child not found");

    if (user.role === "parent") {
      const link = await this.prisma.parentChild.findUnique({
        where: { parentUserId_childProfileId: { parentUserId: this.userIdFromJwt(user), childProfileId: child.id } },
      });
      if (!link) throw new ForbiddenException("Not your child");
    }

    await this.prisma.$transaction([
      this.prisma.childProfile.update({
        where: { id: child.id },
        data: { isActive: false },
      }),
      this.prisma.linkInvite.updateMany({
        where: { childProfileId: child.id, isRevoked: false },
        data: { isRevoked: true },
      }),
    ]);

    return { ok: true };
  }
}
