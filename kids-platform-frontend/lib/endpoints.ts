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

export async function getAdminGameLevels(gameId?: number) {
  const query = gameId ? `?gameId=${encodeURIComponent(String(gameId))}` : "";
  return api<AdminGameLevelItem[]>(`/admin/game-levels${query}`, "GET");
}

export async function createAdminGameLevel(payload: {
  gameId: number;
  difficulty: number;
  title: string;
  levelNumber?: number;
  isActive?: boolean;
}) {
  return api<{ id: number }>("/admin/game-levels", "POST", payload);
}

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

export async function deleteAdminGameLevel(levelId: number) {
  return api<{ ok: true }>(`/admin/game-levels/${levelId}`, "DELETE");
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
  levelId?: number;
  position: number;
  isActive?: boolean;
}) {
  return api<{ id: number }>("/admin/tasks", "POST", payload);
}

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
}) {
  return api<{ id: number }>("/admin/badges", "POST", payload);
}

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
  difficultyLevels: number[];
  availableDifficulties: number[];
  difficultyTaskCounts: Array<{ difficulty: number; count: number }>;
};

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
    taskVersion: { id: number; prompt: string; data: any };
  };
};

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
  | { attemptId: number; isCorrect: boolean; finished: true; summary: any }
  | {
      attemptId: number;
      isCorrect: boolean;
      finished: false;
      nextTask: any;
      progress?: { score: number; correctCount: number; totalCount: number; totalTasks?: number };
    };

export async function submitAnswer(
  attemptId: number,
  payload: { taskId: number; taskVersionId: number; userAnswer: any }
) {
  return api<AnswerResponse>(`/attempts/${attemptId}/answer`, "POST", payload);
}

export async function finishAttempt(attemptId: number, durationSec?: number) {
  return api<{ attemptId: number; finished: true; summary: { score: number; correctCount: number; totalCount: number } }>(
    `/attempts/${attemptId}/finish`,
    "POST",
    durationSec !== undefined ? { durationSec } : undefined
  );
}
