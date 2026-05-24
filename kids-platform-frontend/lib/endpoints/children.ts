import { api } from "../api";

export async function getChildren() { return api<Array<{ id: number; name: string; ageGroupCode: string; avatar?: string | null }>>("/children", "GET"); }
export async function createChild(name: string, ageGroupCode: string) { return api<{ id: number; name: string; ageGroupCode: string }>("/children", "POST", { name, ageGroupCode }); }
export async function createInvite(childId: number) { return api<{ code: string; expiresAt: string; child: { id: number; name: string; ageGroupCode: string } }>(`/children/${childId}/invite`, "POST"); }
export async function deleteChild(childId: number) { return api<{ ok: true }>(`/children/${childId}`, "DELETE"); }
export async function joinByCode(code: string) { return api<{ childProfileId: number; childName: string; ageGroupCode: string; avatar?: string | null }>("/child/join", "POST", { code }); }

export type ChildStats = { child: { id: number; name: string; ageGroupCode: string }; summary: { totalAttempts: number; finishedAttempts: number; totalScore: number; totalCorrect: number; totalQuestions: number; activityYearDays?: Array<{ date: string; didPlay: boolean; levelsPassed: number; durationSec: number; }>; activity14Days?: Array<{ date: string; didPlay: boolean; levelsPassed: number; durationSec: number; }>; }; attempts: Array<{ id: number; game: { id: number; title: string; moduleCode: string }; score: number; correctCount: number; totalCount: number; isFinished: boolean; durationSec?: number | null; createdAt: string; finishedAt: string | null; }>; };
export async function getChildStats(childId: number) { return api<ChildStats>(`/children/${childId}/stats`, "GET"); }
export async function getChildStatsPublic(childId: number) { return api<ChildStats>(`/child/${childId}/stats`, "GET"); }

export type ChildBadgeItem = { id: number; code: string; title: string; description?: string | null; isEarned: boolean; metricKey?: string | null; metricLabel?: string | null; currentValue?: number | null; targetValue?: number | null; progressPercent?: number | null; };
export type ChildBadgesResponse = { finishedAttempts: number; totalStars: number; loginDays?: number; totalAttempts?: number; correctAnswers?: number; perfectGames?: number; moduleStats?: { logic: { finishedAttempts: number; totalStars: number }; math: { finishedAttempts: number; totalStars: number }; english: { finishedAttempts: number; totalStars: number }; }; badges: ChildBadgeItem[]; };
export async function getChildBadges(childId: number) { return api<ChildBadgesResponse>(`/children/${childId}/badges`, "GET"); }
export async function getChildBadgesPublic(childId: number) { return api<ChildBadgesResponse>(`/child/${childId}/badges`, "GET"); }

export type AvatarShopAvatar = { id: string; image: string; name: string; price: number; };
export type AvatarShopResponse = { stars: { earned: number; spent: number; available: number; }; activeAvatarId: string; purchasedAvatarIds: string[]; avatars: AvatarShopAvatar[]; };
export async function getAvatarShop(childId: number) { return api<AvatarShopResponse>(`/child/${childId}/avatar-shop`, "GET"); }
export async function buyAvatar(childId: number, avatarId: string) { return api<AvatarShopResponse>(`/child/${childId}/avatar-shop/buy`, "POST", { avatarId }); }
export async function setActiveAvatar(childId: number, avatarId: string) { return api<AvatarShopResponse>(`/child/${childId}/avatar`, "PATCH", { avatarId }); }
