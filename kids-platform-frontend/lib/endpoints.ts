import { api } from "./api";

export async function register(email: string, username: string, password: string) {
  return api<{ accessToken: string; user: { id: number; email: string; role: string } }>(
    "/auth/register",
    "POST",
    { email, username, password }
  );
}

export async function login(email: string, password: string) {
  return api<{ accessToken: string; user: { id: number; email: string; role: string } }>(
    "/auth/login",
    "POST",
    { email, password }
  );
}

export async function getChildren() {
  return api<Array<{ id: number; name: string; ageGroupCode: string }>>("/children", "GET");
}

export async function createChild(name: string, ageGroupCode: string) {
  return api<{ id: number; name: string; ageGroupCode: string }>(
    "/children",
    "POST",
    { name, ageGroupCode }
  );
}

export async function createInvite(childId: number) {
  return api<{ code: string; expiresAt: string; child: { id: number; name: string; ageGroupCode: string } }>(
    `/children/${childId}/invite`,
    "POST"
  );
}

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
  };
  attempts: Array<{
    id: number;
    game: { id: number; title: string; moduleCode: string };
    score: number;
    correctCount: number;
    totalCount: number;
    isFinished: boolean;
    createdAt: string;
    finishedAt: string | null;
  }>;
};

export async function getChildStats(childId: number) {
  return api<ChildStats>(`/children/${childId}/stats`, "GET");
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
  icon?: string | null;
};

export async function getAdminModules() {
  return api<AdminModuleItem[]>("/admin/modules", "GET");
}

export async function getAdminGameTypes() {
  return api<AdminGameTypeItem[]>("/admin/game-types", "GET");
}

export async function getAdminAgeGroups() {
  return api<AdminAgeGroupItem[]>("/admin/age-groups", "GET");
}

export async function getAdminGames() {
  return api<AdminGameItem[]>("/admin/games", "GET");
}

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

export async function deleteAdminAgeGroup(ageGroupId: number) {
  return api<{ ok: true }>(`/admin/age-groups/${ageGroupId}`, "DELETE");
}

export async function createAdminGameType(payload: {
  code: string;
  title: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
}) {
  return api<{ id: number }>("/admin/game-types", "POST", payload);
}

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

export async function deleteAdminGameType(gameTypeId: number) {
  return api<{ ok: true }>(`/admin/game-types/${gameTypeId}`, "DELETE");
}

export async function getAdminTasks() {
  return api<AdminTaskItem[]>("/admin/tasks", "GET");
}

export async function getAdminTaskVersions() {
  return api<AdminTaskVersionItem[]>("/admin/task-versions", "GET");
}

export async function getAdminBadges() {
  return api<AdminBadgeItem[]>("/admin/badges", "GET");
}

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

export async function createAdminTask(payload: {
  gameId: number;
  position: number;
  isActive?: boolean;
}) {
  return api<{ id: number }>("/admin/tasks", "POST", payload);
}

export async function updateAdminTask(
  taskId: number,
  payload: {
    position?: number;
    isActive?: boolean;
  }
) {
  return api<{ id: number }>(`/admin/tasks/${taskId}`, "PATCH", payload);
}

export async function deleteAdminTask(taskId: number) {
  return api<{ ok: true }>(`/admin/tasks/${taskId}`, "DELETE");
}

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

export async function deleteAdminTaskVersion(taskVersionId: number) {
  return api<{ ok: true }>(`/admin/task-versions/${taskVersionId}`, "DELETE");
}

export async function createAdminBadge(payload: {
  code: string;
  title: string;
  description?: string;
  icon?: string;
}) {
  return api<{ id: number }>("/admin/badges", "POST", payload);
}

export async function updateAdminBadge(
  badgeId: number,
  payload: {
    code?: string;
    title?: string;
    description?: string;
    icon?: string;
  }
) {
  return api<{ id: number }>(`/admin/badges/${badgeId}`, "PATCH", payload);
}

export async function deleteAdminBadge(badgeId: number) {
  return api<{ ok: true }>(`/admin/badges/${badgeId}`, "DELETE");
}

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

export async function deleteAdminGame(gameId: number) {
  return api<{ ok: true }>(`/admin/games/${gameId}`, "DELETE");
}

export async function joinByCode(code: string) {
  return api<{ childProfileId: number; childName: string; ageGroupCode: string }>(
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
  icon?: string | null;
  isEarned: boolean;
};

export type ChildBadgesResponse = {
  finishedAttempts: number;
  badges: ChildBadgeItem[];
};

export async function getChildBadges(childId: number) {
  return api<ChildBadgesResponse>(`/children/${childId}/badges`, "GET");
}

export async function getChildBadgesPublic(childId: number) {
  return api<ChildBadgesResponse>(`/child/${childId}/badges`, "GET");
}


export type GameListItem = {
  id: number;
  title: string;
  moduleCode: string;
  minAgeGroupCode: string;
  difficulty: number;
};

export async function getGames(ageGroupCode: string) {
  return api<GameListItem[]>(`/games?ageGroupCode=${encodeURIComponent(ageGroupCode)}`, "GET");
}

export type StartAttemptResponse = {
  attemptId: number;
  game: { id: number; title: string; moduleCode: string };
  task: {
    taskId: number;
    position: number;
    taskVersion: { id: number; prompt: string; data: any };
  };
};

export async function startAttempt(childProfileId: number, gameId: number) {
  return api<StartAttemptResponse>("/attempts/start", "POST", { childProfileId, gameId });
}

export type AnswerResponse =
  | { attemptId: number; isCorrect: boolean; finished: true; summary: any }
  | { attemptId: number; isCorrect: boolean; finished: false; nextTask: any; progress?: any };

export async function submitAnswer(
  attemptId: number,
  payload: { taskId: number; taskVersionId: number; userAnswer: any }
) {
  return api<AnswerResponse>(`/attempts/${attemptId}/answer`, "POST", payload);
}
