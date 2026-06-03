import { api } from "../api";

export type GameListItem = {
  id: number;
  title: string;
  moduleCode: string;
  gameTypeCode: string;
  gameTypeTitle: string;
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
  if (childProfileId !== undefined) query.set("childProfileId", String(childProfileId));
  return api<GameLevelsResponse>(`/games/${gameId}/levels?${query.toString()}`, "GET");
}

export type StartAttemptResponse = {
  attemptId: number;
  game: { id: number; title: string; moduleCode: string };
  level: { id: number; number: number; title: string };
  totalTasks: number;
  task: { taskId: number; position: number; taskVersion: { id: number; prompt: string; data: any; explanation?: string | null } };
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
  | { attemptId: number; isCorrect: boolean; finished: true; explanation?: string | null; summary: { score: number; correctCount: number; totalCount: number } }
  | { attemptId: number; isCorrect: boolean; finished: false; explanation?: string | null; nextTask: { taskId: number; position: number; taskVersion: { id: number; prompt: string; data: any; explanation?: string | null } }; progress?: { score: number; correctCount: number; totalCount: number; totalTasks?: number } };

export async function submitAnswer(attemptId: number, payload: { taskId: number; taskVersionId: number; userAnswer: any }) {
  return api<AnswerResponse>(`/attempts/${attemptId}/answer`, "POST", payload);
}

export async function finishAttempt(attemptId: number, durationSec?: number) {
  return api<{ attemptId: number; finished: true; summary: { score: number; correctCount: number; totalCount: number } }>(
    `/attempts/${attemptId}/finish`,
    "POST",
    durationSec !== undefined ? { durationSec } : undefined
  );
}
