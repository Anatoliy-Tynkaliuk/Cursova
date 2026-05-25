import { ChildrenService } from "./children.service";

describe("ChildrenService integration (delegation)", () => {
  const prisma: any = {
    childProfile: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
    parentChild: { findMany: jest.fn(), create: jest.fn() },
    linkInvite: { updateMany: jest.fn() },
    $transaction: jest.fn(async (ops: any[]) => Promise.all(ops)),
    ageGroup: { findUnique: jest.fn() },
  };

  const accessPolicy: any = {
    ensureParentOrAdmin: jest.fn(),
    ensureParentOwnsChild: jest.fn(),
  };

  const inviteService: any = { createInvite: jest.fn(), joinByCode: jest.fn() };
  const statsService: any = { getStats: jest.fn(), getBadges: jest.fn() };
  const avatarService: any = { fallbackAvatarImage: jest.fn(() => "/avatars/astro-boy.png"), getAvatarShop: jest.fn(), buyAvatar: jest.fn(), setActiveAvatar: jest.fn() };

  const service = new ChildrenService(prisma, accessPolicy, inviteService, statsService, avatarService);

  beforeEach(() => jest.clearAllMocks());

  it("delegates createInvite to invite service", async () => {
    inviteService.createInvite.mockResolvedValue({ code: "A" });
    const result = await service.createInvite({ role: "admin", sub: "1" }, 5);
    expect(inviteService.createInvite).toHaveBeenCalledWith({ role: "admin", sub: "1" }, 5);
    expect(result).toEqual({ code: "A" });
  });

  it("delegates getStats to stats service", async () => {
    statsService.getStats.mockResolvedValue({ summary: {} });
    const result = await service.getStats({ role: "admin", sub: "1" }, 2);
    expect(statsService.getStats).toHaveBeenCalledWith({ role: "admin", sub: "1" }, 2);
    expect(result).toEqual({ summary: {} });
  });
});
