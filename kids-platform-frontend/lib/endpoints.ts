import { api } from "./api";

export async function register(email: string, password: string) {
  return api<{ accessToken: string; user: { id: number; email: string; role: string } }>(
    "/auth/register",
    "POST",
    { email, password }
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

export async function joinByCode(code: string) {
  return api<{ childProfileId: number; childName: string; ageGroupCode: string }>(
    "/child/join",
    "POST",
    { code }
  );
}


export type GameListItem = {
  id: number;
  title: string;
  moduleCode: string;
  gameTypeCode: string;
  minAgeGroupCode: string;
  difficulty: number;
};

export async function getGames(ageGroupCode: string) {
  return api<GameListItem[]>(`/games?ageGroupCode=${encodeURIComponent(ageGroupCode)}`, "GET");
}

export type StartAttemptResponse = {
  attemptId: number;
  game: { id: number; title: string; moduleCode: string; gameTypeCode: string };
  task: {
    taskId: number;
    position: number;
    type: string;
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
