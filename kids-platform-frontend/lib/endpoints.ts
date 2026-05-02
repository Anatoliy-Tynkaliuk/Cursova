/**
 * 📘 ОГЛЯД ФАЙЛУ: `kids-platform-frontend/lib/endpoints.ts`.
 * ЩО ЦЕ: цей файл — частина навчальної платформи для дітей (бекенд API або фронтенд-екран).
 * НАВІЩО: реалізує конкретний шмат логіки (дані, перевірки, маршрути, або відображення інтерфейсу).
 * ЯК ПРАЦЮЄ: імпортує залежності, приймає вхідні дані, обробляє їх, та повертає результат/HTML/API-відповідь.
 * ВЗАЄМОДІЯ З ІНШИМИ ФАЙЛАМИ: через import/export, виклики сервісів, DTO, props, HTTP-запити.
 * ГЛОСАРІЙ:
 * - API: правила обміну даними між клієнтом (фронтенд) і сервером (бекенд).
 * - DTO: структура даних, яку дозволено приймати/повертати.
 * - Service: шар бізнес-логіки (обчислення, перевірки, робота з БД).
 * - Controller/Page: точка входу запиту користувача або сторінка інтерфейсу.
 * - Component: перевикористовуваний UI-блок.
 * - Prisma/ORM: інструмент доступу до бази даних через код.
 */


import { api } from "./api";

// Функція: register. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: register. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function register(email: string, username: string, password: string) {
  return api<{ accessToken: string; user: { id: number; email: string; role: string } }>(
    "/auth/register",
    "POST",
    { email, username, password }
  );
}

// Функція: login. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: login. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function login(email: string, password: string) {
  return api<{ accessToken: string; user: { id: number; email: string; role: string } }>(
    "/auth/login",
    "POST",
    { email, password }
  );
}

// Функція: getMe. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: getMe. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function getMe() {
  return api<{ id: number; email: string; username: string; role: string }>("/auth/me", "GET");
}

// Функція: getChildren. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: getChildren. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function getChildren() {
  return api<Array<{ id: number; name: string; ageGroupCode: string }>>("/children", "GET");
}

// Функція: createChild. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: createChild. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function createChild(name: string, ageGroupCode: string) {
  return api<{ id: number; name: string; ageGroupCode: string }>(
    "/children",
    "POST",
    { name, ageGroupCode }
  );
}

// Функція: createInvite. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: createInvite. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function createInvite(childId: number) {
  return api<{ code: string; expiresAt: string; child: { id: number; name: string; ageGroupCode: string } }>(
    `/children/${childId}/invite`,
    "POST"
  );
}

// Функція: deleteChild. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: deleteChild. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function deleteChild(childId: number) {
  return api<{ ok: true }>(`/children/${childId}`, "DELETE");
}

export type ChildStats = {
  child: { id: number; name: string; ageGroupCode: string };
  summary: {
    totalAttempts: number;
    finishedAttempts: number;
    totalScore: number;
    totalCorrect: number;
    totalQuestions: number;
    activityYearDays?: Array<{
      date: string;
      didPlay: boolean;
      levelsPassed: number;
      durationSec: number;
    }>;
    activity14Days?: Array<{
      date: string;
      didPlay: boolean;
      levelsPassed: number;
      durationSec: number;
    }>;
  };
  attempts: Array<{
    id: number;
    game: { id: number; title: string; moduleCode: string };
    score: number;
    correctCount: number;
    totalCount: number;
    isFinished: boolean;
    durationSec?: number | null;
    createdAt: string;
    finishedAt: string | null;
  }>;
};

// Функція: getChildStats. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: getChildStats. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function getChildStats(childId: number) {
  return api<ChildStats>(`/children/${childId}/stats`, "GET");
}

// Функція: getChildStatsPublic. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: getChildStatsPublic. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function getChildStatsPublic(childId: number) {
  return api<ChildStats>(`/child/${childId}/stats`, "GET");
}
export type AvatarShopAvatar = {
  id: string;
  image: string;
  name: string;
  price: number;
};

export type AvatarShopResponse = {
  stars: {
    earned: number;
    spent: number;
    available: number;
  };
  activeAvatarId: string;
  purchasedAvatarIds: string[];
  avatars: AvatarShopAvatar[];
};

// Функція: getAvatarShop. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: getAvatarShop. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function getAvatarShop(childId: number) {
  return api<AvatarShopResponse>(`/child/${childId}/avatar-shop`, "GET");
}

// Функція: buyAvatar. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: buyAvatar. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function buyAvatar(childId: number, avatarId: string) {
  return api<AvatarShopResponse>(`/child/${childId}/avatar-shop/buy`, "POST", { avatarId });
}

// Функція: setActiveAvatar. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: setActiveAvatar. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function setActiveAvatar(childId: number, avatarId: string) {
  return api<AvatarShopResponse>(`/child/${childId}/avatar`, "PATCH", { avatarId });
}


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

// Функція: getAdminModules. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: getAdminModules. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function getAdminModules() {
  return api<AdminModuleItem[]>("/admin/modules", "GET");
}

// Функція: getAdminGameTypes. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: getAdminGameTypes. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function getAdminGameTypes() {
  return api<AdminGameTypeItem[]>("/admin/game-types", "GET");
}

// Функція: getAdminAgeGroups. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: getAdminAgeGroups. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function getAdminAgeGroups() {
  return api<AdminAgeGroupItem[]>("/admin/age-groups", "GET");
}

// Функція: getAdminGames. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: getAdminGames. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function getAdminGames() {
  return api<AdminGameItem[]>("/admin/games", "GET");
}


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

// Функція: getAdminGameLevels. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: getAdminGameLevels. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function getAdminGameLevels(gameId?: number) {
  const query = gameId ? `?gameId=${encodeURIComponent(String(gameId))}` : "";
  return api<AdminGameLevelItem[]>(`/admin/game-levels${query}`, "GET");
}

// Функція: createAdminGameLevel. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: createAdminGameLevel. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function createAdminGameLevel(payload: {
  gameId: number;
  difficulty: number;
  title: string;
  levelNumber?: number;
  isActive?: boolean;
}) {
  return api<{ id: number }>("/admin/game-levels", "POST", payload);
}

// Функція: updateAdminGameLevel. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: updateAdminGameLevel. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function updateAdminGameLevel(
  levelId: number,
  payload: {
    title?: string;
    levelNumber?: number;
    isActive?: boolean;
  }
) {
  return api<{ id: number }>(`/admin/game-levels/${levelId}`, "PATCH", payload);
}

// Функція: deleteAdminGameLevel. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: deleteAdminGameLevel. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function deleteAdminGameLevel(levelId: number) {
  return api<{ ok: true }>(`/admin/game-levels/${levelId}`, "DELETE");
}

// Функція: createAdminAgeGroup. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: createAdminAgeGroup. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function createAdminAgeGroup(payload: {
  code: string;
  title: string;
  minAge: number;
  maxAge: number;
  sortOrder?: number;
  isActive?: boolean;
}) {
  return api<{ id: number }>("/admin/age-groups", "POST", payload);
}

// Функція: updateAdminAgeGroup. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: updateAdminAgeGroup. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function updateAdminAgeGroup(
  ageGroupId: number,
  payload: {
    code?: string;
    title?: string;
    minAge?: number;
    maxAge?: number;
    sortOrder?: number;
    isActive?: boolean;
  }
) {
  return api<{ id: number }>(`/admin/age-groups/${ageGroupId}`, "PATCH", payload);
}

// Функція: deleteAdminAgeGroup. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: deleteAdminAgeGroup. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function deleteAdminAgeGroup(ageGroupId: number) {
  return api<{ ok: true }>(`/admin/age-groups/${ageGroupId}`, "DELETE");
}

// Функція: createAdminGameType. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: createAdminGameType. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function createAdminGameType(payload: {
  code: string;
  title: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
}) {
  return api<{ id: number }>("/admin/game-types", "POST", payload);
}

// Функція: updateAdminGameType. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: updateAdminGameType. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function updateAdminGameType(
  gameTypeId: number,
  payload: {
    code?: string;
    title?: string;
    description?: string;
    icon?: string;
    isActive?: boolean;
  }
) {
  return api<{ id: number }>(`/admin/game-types/${gameTypeId}`, "PATCH", payload);
}

// Функція: deleteAdminGameType. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: deleteAdminGameType. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function deleteAdminGameType(gameTypeId: number) {
  return api<{ ok: true }>(`/admin/game-types/${gameTypeId}`, "DELETE");
}

// Функція: getAdminTasks. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: getAdminTasks. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function getAdminTasks() {
  return api<AdminTaskItem[]>("/admin/tasks", "GET");
}

// Функція: getAdminTaskVersions. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: getAdminTaskVersions. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function getAdminTaskVersions() {
  return api<AdminTaskVersionItem[]>("/admin/task-versions", "GET");
}

// Функція: getAdminBadges. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: getAdminBadges. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function getAdminBadges() {
  return api<AdminBadgeItem[]>("/admin/badges", "GET");
}

// Функція: createAdminGame. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: createAdminGame. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function createAdminGame(payload: {
  moduleId: number;
  gameTypeId: number;
  minAgeGroupId: number;
  title: string;
  description?: string;
  difficulty?: number;
  isActive?: boolean;
}) {
  return api<{ id: number }>("/admin/games", "POST", payload);
}

// Функція: createAdminTask. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: createAdminTask. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function createAdminTask(payload: {
  gameId: number;
  levelId?: number;
  position: number;
  isActive?: boolean;
}) {
  return api<{ id: number }>("/admin/tasks", "POST", payload);
}

// Функція: updateAdminTask. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: updateAdminTask. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function updateAdminTask(
  taskId: number,
  payload: {
    levelId?: number | null;
    position?: number;
    isActive?: boolean;
  }
) {
  return api<{ id: number }>(`/admin/tasks/${taskId}`, "PATCH", payload);
}

// Функція: deleteAdminTask. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: deleteAdminTask. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function deleteAdminTask(taskId: number) {
  return api<{ ok: true }>(`/admin/tasks/${taskId}`, "DELETE");
}

// Функція: createAdminTaskVersion. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: createAdminTaskVersion. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function createAdminTaskVersion(payload: {
  taskId: number;
  version: number;
  prompt: string;
  dataJson?: unknown;
  correctJson: unknown;
  explanation?: string;
  difficulty?: number;
  isCurrent?: boolean;
}) {
  return api<{ id: number }>("/admin/task-versions", "POST", payload);
}

// Функція: updateAdminTaskVersion. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: updateAdminTaskVersion. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function updateAdminTaskVersion(
  taskVersionId: number,
  payload: {
    prompt?: string;
    dataJson?: unknown;
    correctJson?: unknown;
    explanation?: string;
    difficulty?: number;
    isCurrent?: boolean;
  }
) {
  return api<{ id: number }>(`/admin/task-versions/${taskVersionId}`, "PATCH", payload);
}

// Функція: deleteAdminTaskVersion. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: deleteAdminTaskVersion. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function deleteAdminTaskVersion(taskVersionId: number) {
  return api<{ ok: true }>(`/admin/task-versions/${taskVersionId}`, "DELETE");
}

// Функція: createAdminBadge. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: createAdminBadge. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function createAdminBadge(payload: {
  code: string;
  title: string;
  description?: string;
}) {
  return api<{ id: number }>("/admin/badges", "POST", payload);
}

// Функція: updateAdminBadge. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: updateAdminBadge. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function updateAdminBadge(
  badgeId: number,
  payload: {
    code?: string;
    title?: string;
    description?: string;
  }
) {
  return api<{ id: number }>(`/admin/badges/${badgeId}`, "PATCH", payload);
}

// Функція: deleteAdminBadge. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: deleteAdminBadge. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function deleteAdminBadge(badgeId: number) {
  return api<{ ok: true }>(`/admin/badges/${badgeId}`, "DELETE");
}

// Функція: updateAdminGame. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: updateAdminGame. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function updateAdminGame(
  gameId: number,
  payload: {
    title?: string;
    description?: string;
    difficulty?: number;
    isActive?: boolean;
  }
) {
  return api<{ id: number }>(`/admin/games/${gameId}`, "PATCH", payload);
}

// Функція: deleteAdminGame. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: deleteAdminGame. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function deleteAdminGame(gameId: number) {
  return api<{ ok: true }>(`/admin/games/${gameId}`, "DELETE");
}

// Функція: joinByCode. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: joinByCode. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function joinByCode(code: string) {
  return api<{ childProfileId: number; childName: string; ageGroupCode: string; avatar?: string | null }>(
    "/child/join",
    "POST",
    { code }
  );
}

export type ChildBadgeItem = {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  isEarned: boolean;
  metricKey?: string | null;
  metricLabel?: string | null;
  currentValue?: number | null;
  targetValue?: number | null;
  progressPercent?: number | null;
};

export type ChildBadgesResponse = {
  finishedAttempts: number;
  totalStars: number;
  loginDays?: number;
  totalAttempts?: number;
  correctAnswers?: number;
  perfectGames?: number;
  badges: ChildBadgeItem[];
};

// Функція: getChildBadges. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: getChildBadges. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function getChildBadges(childId: number) {
  return api<ChildBadgesResponse>(`/children/${childId}/badges`, "GET");
}

// Функція: getChildBadgesPublic. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: getChildBadgesPublic. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function getChildBadgesPublic(childId: number) {
  return api<ChildBadgesResponse>(`/child/${childId}/badges`, "GET");
}


export type GameListItem = {
  id: number;
  title: string;
  moduleCode: string;
  minAgeGroupCode: string;
  difficulty: number;
  difficultyLevels: number[];
  availableDifficulties: number[];
  difficultyTaskCounts: Array<{ difficulty: number; count: number }>;
};

// Функція: getGames. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: getGames. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function getGames(ageGroupCode: string) {
  return api<GameListItem[]>(`/games?ageGroupCode=${encodeURIComponent(ageGroupCode)}`, "GET");
}


export type GameLevelsResponse = {
  gameId: number;
  gameTitle: string;
  moduleCode: string;
  difficulty: number;
  levels: Array<{
    levelId: number;
    level: number;
    title: string;
    state: "locked" | "unlocked" | "completed";
    isLocked: boolean;
    isCompleted: boolean;
  }>;
};

// Функція: getGameLevels. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: getGameLevels. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function getGameLevels(gameId: number, difficulty: number, childProfileId?: number) {
  const query = new URLSearchParams({ difficulty: String(difficulty) });
  if (childProfileId !== undefined) {
    query.set("childProfileId", String(childProfileId));
  }

  return api<GameLevelsResponse>(`/games/${gameId}/levels?${query.toString()}`, "GET");
}

export type StartAttemptResponse = {
  attemptId: number;
  game: { id: number; title: string; moduleCode: string };
  level: { id: number; number: number; title: string };
  totalTasks: number;
  task: {
    taskId: number;
    position: number;
    taskVersion: { id: number; prompt: string; data: any; explanation?: string | null };
  };
};

// Функція: startAttempt. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: startAttempt. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function startAttempt(childProfileId: number, gameId: number, difficulty: number, level?: number, levelId?: number) {
  return api<StartAttemptResponse>("/attempts/start", "POST", {
    childProfileId,
    gameId,
    ...(difficulty !== undefined ? { difficulty } : {}),
    ...(level !== undefined ? { level } : {}),
    ...(levelId !== undefined ? { levelId } : {}),
  });
}

export type AnswerResponse =
  | {
      attemptId: number;
      isCorrect: boolean;
      finished: true;
      explanation?: string | null;
      summary: { score: number; correctCount: number; totalCount: number };
    }
  | {
      attemptId: number;
      isCorrect: boolean;
      finished: false;
      explanation?: string | null;
      nextTask: {
        taskId: number;
        position: number;
        taskVersion: { id: number; prompt: string; data: any; explanation?: string | null };
      };
      progress?: { score: number; correctCount: number; totalCount: number; totalTasks?: number };
    };

// Функція: submitAnswer. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: submitAnswer. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function submitAnswer(
  attemptId: number,
  payload: { taskId: number; taskVersionId: number; userAnswer: any }
) {
  return api<AnswerResponse>(`/attempts/${attemptId}/answer`, "POST", payload);
}

// Функція: finishAttempt. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: finishAttempt. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export async function finishAttempt(attemptId: number, durationSec?: number) {
  return api<{ attemptId: number; finished: true; summary: { score: number; correctCount: number; totalCount: number } }>(
    `/attempts/${attemptId}/finish`,
    "POST",
    durationSec !== undefined ? { durationSec } : undefined
  );
}
