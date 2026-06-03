import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ChildrenInviteService } from "./children-invite.service";

describe("ChildrenInviteService", () => {
  const policy = {
    ensureParentOrAdmin: jest.fn(),
    ensureParentOwnsChild: jest.fn(),
  };

  const prisma: any = {
    childProfile: { findFirst: jest.fn() },
    linkInvite: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  };

  const service = new ChildrenInviteService(prisma, policy as any);

  beforeEach(() => jest.clearAllMocks());

  it("creates invite for owned child", async () => {
    prisma.childProfile.findFirst.mockResolvedValue({ id: BigInt(3), name: "A", isActive: true, ageGroup: { code: "6_8" } });
    prisma.linkInvite.findUnique.mockResolvedValue(null);
    prisma.linkInvite.create.mockResolvedValue({ code: "ABC123", expiresAt: new Date("2026-06-01T00:00:00.000Z") });

    const result = await service.createInvite({ role: "parent", sub: "1" }, 3);

    expect(policy.ensureParentOrAdmin).toHaveBeenCalled();
    expect(policy.ensureParentOwnsChild).toHaveBeenCalledWith({ role: "parent", sub: "1" }, BigInt(3));
    expect(result.code).toBe("ABC123");
    expect(result.child).toEqual({ id: 3, name: "A", ageGroupCode: "6_8" });
  });

  it("throws on expired code in joinByCode", async () => {
    prisma.linkInvite.findUnique.mockResolvedValue({
      code: "OLD",
      isRevoked: false,
      expiresAt: new Date("2020-01-01T00:00:00.000Z"),
      child: { id: BigInt(2), name: "B", ageGroup: { code: "6_8" }, isActive: true, avatar: null },
    });

    await expect(service.joinByCode("old", "/avatars/default.png")).rejects.toBeInstanceOf(BadRequestException);
  });

  it("throws not found when invite code missing", async () => {
    prisma.linkInvite.findUnique.mockResolvedValue(null);
    await expect(service.joinByCode("X", "/avatars/default.png")).rejects.toBeInstanceOf(NotFoundException);
  });
});
