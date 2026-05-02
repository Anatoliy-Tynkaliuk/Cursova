/**
 * Огляд файлу: `kids-platform-frontend/lib/types.ts`.
 * Призначення: містить частину логіки бекенду/фронтенду платформи навчальних ігор.
 * Взаємодія: імпортує типи, сервіси та компоненти з сусідніх модулів і передає дані через DTO/API props.
 * Терміни: API — контракт обміну даними; DTO — тип вхідних/вихідних даних; Service — бізнес-логіка; Controller/Page — точка входу запитів або UI-екран.
 */

export type GameTypeCode = "choose_answer" | "match_pairs" | "sequence";

export type Game = {
  id: number;
  title: string;
  moduleCode: string;     // зробили string, щоб можна було додавати нові предмети без змін
};

export type TaskVersion = {
  id: number;
  prompt: string;
  data: any; // data_json
};

export type TaskDTO = {
  taskId: number;
  taskVersion: TaskVersion;
};

export type AttemptStartResponse = {
  attemptId: number;
  game: Game;
  task: TaskDTO;
};

export type SubmitAnswerResponse = {
  isCorrect: boolean;
  nextTask?: TaskDTO;
  finished?: boolean;
  score?: number;
};
