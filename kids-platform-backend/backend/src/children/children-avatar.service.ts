import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export type AvatarItem = { id: string; image: string; name: string; price: number };
export const AVATAR_CATALOG: AvatarItem[] = [
  { id: "astro-boy", image: "/avatars/astro-boy.png", name: "Астро Хлопчик", price: 0 },
  { id: "astro-girl", image: "/avatars/astro-girl.png", name: "Астро Дівчинка", price: 20 },
  { id: "rocket", image: "/avatars/rocket.png", name: "Ракета", price: 35 },
  { id: "robot", image: "/avatars/robot.png", name: "Робот", price: 40 },
  { id: "alien", image: "/avatars/alien.png", name: "Прибулець", price: 55 },
  { id: "super-cat", image: "/avatars/super-cat.png", name: "Супер Кіт", price: 60 },
  { id: "unicorn", image: "/avatars/unicorn.png", name: "Космо Єдиноріг", price: 80 },
  { id: "dragon", image: "/avatars/dragon.png", name: "Зоряний Дракон", price: 120 },
];

type AvatarSettings = { purchasedAvatarIds: string[]; activeAvatarId: string };

@Injectable()
export class ChildrenAvatarService {
  constructor(private readonly prisma: PrismaService) {}

  fallbackAvatarImage() { return AVATAR_CATALOG[0].image; }

  private normalizeAvatarSettings(raw: unknown): AvatarSettings {
    const fallbackId = AVATAR_CATALOG[0].id;
    const defaults: AvatarSettings = { purchasedAvatarIds: [fallbackId], activeAvatarId: fallbackId };
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return defaults;

    const input = raw as Record<string, unknown>;
    const purchasedSet = new Set<string>([fallbackId]);
    const purchasedRaw = Array.isArray(input.purchasedAvatarIds) ? input.purchasedAvatarIds : [];
    for (const item of purchasedRaw) {
      if (typeof item !== "string") continue;
      if (AVATAR_CATALOG.some((avatar) => avatar.id === item)) purchasedSet.add(item);
    }

    let activeAvatarId = fallbackId;
    if (typeof input.activeAvatarId === "string" && purchasedSet.has(input.activeAvatarId)) activeAvatarId = input.activeAvatarId;
    return { purchasedAvatarIds: [...purchasedSet], activeAvatarId };
  }

  async getAvatarShop(childId: number, totalStars: number) {
    const child = await this.prisma.childProfile.findFirst({ where: { id: BigInt(childId), isActive: true }, select: { settings: true } });
    if (!child) throw new NotFoundException("Child not found");

    const settings = this.normalizeAvatarSettings(child.settings);
    const spentStars = settings.purchasedAvatarIds.reduce((sum, avatarId) => sum + (AVATAR_CATALOG.find((a) => a.id === avatarId)?.price ?? 0), 0);
    const availableStars = Math.max(0, totalStars - spentStars);

    return { stars: { earned: totalStars, spent: spentStars, available: availableStars }, activeAvatarId: settings.activeAvatarId, purchasedAvatarIds: settings.purchasedAvatarIds, avatars: AVATAR_CATALOG };
  }

  async buyAvatar(childId: number, avatarIdRaw: string, totalStars: number) {
    const avatarId = (avatarIdRaw || "").trim();
    const avatar = AVATAR_CATALOG.find((item) => item.id === avatarId);
    if (!avatar) throw new BadRequestException("Avatar not found");

    const child = await this.prisma.childProfile.findFirst({ where: { id: BigInt(childId), isActive: true }, select: { id: true, settings: true } });
    if (!child) throw new NotFoundException("Child not found");

    const settings = this.normalizeAvatarSettings(child.settings);
    if (settings.purchasedAvatarIds.includes(avatar.id)) return this.getAvatarShop(childId, totalStars);

    const spentStars = settings.purchasedAvatarIds.reduce((sum, purchasedId) => sum + (AVATAR_CATALOG.find((item) => item.id === purchasedId)?.price ?? 0), 0);
    const availableStars = Math.max(0, totalStars - spentStars);
    if (availableStars < avatar.price) throw new BadRequestException("Not enough stars");

    const nextSettings = { ...settings, purchasedAvatarIds: [...settings.purchasedAvatarIds, avatar.id], activeAvatarId: avatar.id };
    await this.prisma.childProfile.update({ where: { id: child.id }, data: { avatar: avatar.image, settings: nextSettings } });
    return this.getAvatarShop(childId, totalStars);
  }

  async setActiveAvatar(childId: number, avatarIdRaw: string, totalStars: number) {
    const avatarId = (avatarIdRaw || "").trim();
    const avatar = AVATAR_CATALOG.find((item) => item.id === avatarId);
    if (!avatar) throw new BadRequestException("Avatar not found");

    const child = await this.prisma.childProfile.findFirst({ where: { id: BigInt(childId), isActive: true }, select: { id: true, settings: true } });
    if (!child) throw new NotFoundException("Child not found");

    const settings = this.normalizeAvatarSettings(child.settings);
    if (!settings.purchasedAvatarIds.includes(avatar.id)) throw new BadRequestException("Avatar is not purchased");

    await this.prisma.childProfile.update({ where: { id: child.id }, data: { avatar: avatar.image, settings: { ...settings, activeAvatarId: avatar.id } } });
    return this.getAvatarShop(childId, totalStars);
  }
}
