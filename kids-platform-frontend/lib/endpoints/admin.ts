import { api } from "../api";

export type AdminModuleItem = {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  isActive: boolean;
};

export type AdminGameTypeItem = {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  isActive: boolean;
};

export type AdminAgeGroupItem = {
  id: number;
  code: string;
  title: string;
  minAge: number;
  maxAge: number;
  sortOrder: number;
  isActive: boolean;
};

export type AdminGameItem = {
  id: number;
  title: string;
  description?: string | null;
  moduleId: number;
  moduleCode: string;
  gameTypeId: number;
  gameTypeCode: string;
  minAgeGroupId: number;
  minAgeGroupCode: string;
  difficulty: number;
  isActive: boolean;
};

export type AdminTaskItem = {
  id: number;
  gameId: number;
  gameTitle: string;
  levelId: number | null;
  levelNumber: number | null;
  difficulty: number | null;
  position: number;
  isActive: boolean;
};

export type AdminTaskVersionItem = {
  id: number;
  taskId: number;
  taskPosition: number;
  version: number;
  prompt: string;
  dataJson: unknown;
  correctJson: unknown;
  explanation?: string | null;
  difficulty: number;
  isCurrent: boolean;
};

export type AdminBadgeItem = {
  id: number;
  code: string;
  title: string;
  description?: string | null;
};

export type AdminGameLevelItem = {
  id: number;
  gameId: number;
  gameTitle: string;
  difficulty: number;
  levelNumber: number;
  title: string;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getAdminModules() { return api<AdminModuleItem[]>("/admin/modules", "GET"); }
export async function getAdminGameTypes() { return api<AdminGameTypeItem[]>("/admin/game-types", "GET"); }
export async function getAdminAgeGroups() { return api<AdminAgeGroupItem[]>("/admin/age-groups", "GET"); }
export async function getAdminGames() { return api<AdminGameItem[]>("/admin/games", "GET"); }
export async function getAdminTasks() { return api<AdminTaskItem[]>("/admin/tasks", "GET"); }
export async function getAdminTaskVersions() { return api<AdminTaskVersionItem[]>("/admin/task-versions", "GET"); }
export async function getAdminBadges() { return api<AdminBadgeItem[]>("/admin/badges", "GET"); }

export async function getAdminGameLevels(gameId?: number) {
  const query = gameId ? `?gameId=${encodeURIComponent(String(gameId))}` : "";
  return api<AdminGameLevelItem[]>(`/admin/game-levels${query}`, "GET");
}

export async function createAdminGameLevel(payload: { gameId: number; difficulty: number; title: string; levelNumber?: number; isActive?: boolean; }) {
  return api<{ id: number }>("/admin/game-levels", "POST", payload);
}
export async function updateAdminGameLevel(levelId: number, payload: { title?: string; levelNumber?: number; isActive?: boolean; }) {
  return api<{ id: number }>(`/admin/game-levels/${levelId}`, "PATCH", payload);
}
export async function deleteAdminGameLevel(levelId: number) { return api<{ ok: true }>(`/admin/game-levels/${levelId}`, "DELETE"); }

export async function createAdminAgeGroup(payload: { code: string; title: string; minAge: number; maxAge: number; sortOrder?: number; isActive?: boolean; }) {
  return api<{ id: number }>("/admin/age-groups", "POST", payload);
}
export async function updateAdminAgeGroup(ageGroupId: number, payload: { code?: string; title?: string; minAge?: number; maxAge?: number; sortOrder?: number; isActive?: boolean; }) {
  return api<{ id: number }>(`/admin/age-groups/${ageGroupId}`, "PATCH", payload);
}
export async function deleteAdminAgeGroup(ageGroupId: number) { return api<{ ok: true }>(`/admin/age-groups/${ageGroupId}`, "DELETE"); }

export async function createAdminGameType(payload: { code: string; title: string; description?: string; icon?: string; isActive?: boolean; }) {
  return api<{ id: number }>("/admin/game-types", "POST", payload);
}
export async function updateAdminGameType(gameTypeId: number, payload: { code?: string; title?: string; description?: string; icon?: string; isActive?: boolean; }) {
  return api<{ id: number }>(`/admin/game-types/${gameTypeId}`, "PATCH", payload);
}
export async function deleteAdminGameType(gameTypeId: number) { return api<{ ok: true }>(`/admin/game-types/${gameTypeId}`, "DELETE"); }

export async function createAdminGame(payload: { moduleId: number; gameTypeId: number; minAgeGroupId: number; title: string; description?: string; difficulty?: number; isActive?: boolean; }) {
  return api<{ id: number }>("/admin/games", "POST", payload);
}
export async function updateAdminGame(gameId: number, payload: { title?: string; description?: string; difficulty?: number; isActive?: boolean; }) {
  return api<{ id: number }>(`/admin/games/${gameId}`, "PATCH", payload);
}
export async function deleteAdminGame(gameId: number) { return api<{ ok: true }>(`/admin/games/${gameId}`, "DELETE"); }

export async function createAdminTask(payload: { gameId: number; levelId?: number; position: number; isActive?: boolean; }) {
  return api<{ id: number }>("/admin/tasks", "POST", payload);
}
export async function updateAdminTask(taskId: number, payload: { levelId?: number | null; position?: number; isActive?: boolean; }) {
  return api<{ id: number }>(`/admin/tasks/${taskId}`, "PATCH", payload);
}
export async function deleteAdminTask(taskId: number) { return api<{ ok: true }>(`/admin/tasks/${taskId}`, "DELETE"); }

export async function createAdminTaskVersion(payload: { taskId: number; version: number; prompt: string; dataJson?: unknown; correctJson: unknown; explanation?: string; difficulty?: number; isCurrent?: boolean; }) {
  return api<{ id: number }>("/admin/task-versions", "POST", payload);
}
export async function updateAdminTaskVersion(taskVersionId: number, payload: { prompt?: string; dataJson?: unknown; correctJson?: unknown; explanation?: string; difficulty?: number; isCurrent?: boolean; }) {
  return api<{ id: number }>(`/admin/task-versions/${taskVersionId}`, "PATCH", payload);
}
export async function deleteAdminTaskVersion(taskVersionId: number) { return api<{ ok: true }>(`/admin/task-versions/${taskVersionId}`, "DELETE"); }

export async function createAdminBadge(payload: { code: string; title: string; description?: string; }) {
  return api<{ id: number }>("/admin/badges", "POST", payload);
}
export async function updateAdminBadge(badgeId: number, payload: { code?: string; title?: string; description?: string; }) {
  return api<{ id: number }>(`/admin/badges/${badgeId}`, "PATCH", payload);
}
export async function deleteAdminBadge(badgeId: number) { return api<{ ok: true }>(`/admin/badges/${badgeId}`, "DELETE"); }
