import { BadRequestException } from "@nestjs/common";
import { ChildrenAvatarService } from "./children-avatar.service";

describe("ChildrenAvatarService", () => {
  const prisma: any = {
    childProfile: { findFirst: jest.fn(), update: jest.fn() },
  };
  const service = new ChildrenAvatarService(prisma);

  beforeEach(() => jest.clearAllMocks());

  it("returns fallback avatar image", () => {
    expect(service.fallbackAvatarImage()).toBe("/avatars/astro-boy.png");
  });

  it("calculates available stars in avatar shop", async () => {
    prisma.childProfile.findFirst.mockResolvedValue({ settings: { purchasedAvatarIds: ["astro-boy", "rocket"], activeAvatarId: "rocket" } });

    const result = await service.getAvatarShop(1, 100);
    expect(result.stars.spent).toBe(35);
    expect(result.stars.available).toBe(65);
  });

  it("throws when buying unknown avatar", async () => {
    await expect(service.buyAvatar(1, "unknown", 10)).rejects.toBeInstanceOf(BadRequestException);
  });
});
