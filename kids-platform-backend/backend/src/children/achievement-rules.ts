/**
 * 📘 ОГЛЯД ФАЙЛУ: `kids-platform-backend/backend/src/children/achievement-rules.ts`.
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


export type AchievementMetricKey =
  | 'finished_games'
  | 'total_stars'
  | 'login_days'
  | 'correct_answers'
  | 'total_attempts'
  | 'perfect_games';

export type AchievementMetrics = {
  finishedAttempts: number;
  totalStars: number;
  loginDays: number;
  correctAnswers: number;
  totalAttempts: number;
  perfectGames: number;
};

export type AchievementRule = {
  metricKey: AchievementMetricKey;
  metricLabel: string;
  targetValue: number;
  currentValue: number;
  progressPercent: number;
};

const METRIC_META: Record<
  AchievementMetricKey,
  { label: string; getter: (m: AchievementMetrics) => number }
> = {
  finished_games: { label: 'Пройдено ігор', getter: (m) => m.finishedAttempts },
  total_stars: { label: 'Зароблено зірок', getter: (m) => m.totalStars },
  login_days: { label: 'Днів активності', getter: (m) => m.loginDays },
  correct_answers: {
    label: 'Правильних відповідей',
    getter: (m) => m.correctAnswers,
  },
  total_attempts: { label: 'Усього спроб', getter: (m) => m.totalAttempts },
  perfect_games: { label: 'Ідеальних ігор', getter: (m) => m.perfectGames },
};

const CODE_ALIASES: Record<string, AchievementMetricKey> = {
  FINISHED: 'finished_games',
  FINISHED_GAMES: 'finished_games',
  GAMES_COMPLETED: 'finished_games',
  STARS: 'total_stars',
  TOTAL_STARS: 'total_stars',
  LOGIN_DAYS: 'login_days',
  DAILY_LOGINS: 'login_days',
  CORRECT_ANSWERS: 'correct_answers',
  ATTEMPTS: 'total_attempts',
  TOTAL_ATTEMPTS: 'total_attempts',
  PERFECT_GAMES: 'perfect_games',
};

// Функція: buildAchievementRule. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: buildAchievementRule. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export function buildAchievementRule(
  code: string,
  metrics: AchievementMetrics,
): AchievementRule | null {
  const match = code
    .trim()
    .toUpperCase()
    .match(/^([A-Z_]+)_(\d+)$/);
  if (!match) return null;

  const codeMetric = match[1];
  const targetValue = Number(match[2]);
  if (!Number.isFinite(targetValue) || targetValue <= 0) return null;

  const metricKey = CODE_ALIASES[codeMetric];
  if (!metricKey) return null;

  const metricMeta = METRIC_META[metricKey];
  const currentValue = metricMeta.getter(metrics);
  const progressPercent = Math.max(
    0,
    Math.min(100, Math.round((currentValue / targetValue) * 100)),
  );

  return {
    metricKey,
    metricLabel: metricMeta.label,
    targetValue,
    currentValue,
    progressPercent,
  };
}
