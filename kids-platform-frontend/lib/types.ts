/**
 * 📘 ОГЛЯД ФАЙЛУ: `kids-platform-frontend/lib/types.ts`.
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
