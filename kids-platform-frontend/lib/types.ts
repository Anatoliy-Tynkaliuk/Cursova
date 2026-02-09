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
