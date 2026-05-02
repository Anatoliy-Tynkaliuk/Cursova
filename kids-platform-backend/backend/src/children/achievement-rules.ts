/**
 * ФАЙЛ: `src/children/achievement-rules.ts`.
 * ЗАГАЛОМ: цей файл є частиною backend-сервера на NestJS і реалізує окремий модуль/шар архітектури.
 * ВЗАЄМОДІЯ: файл імпортує сутності з інших модулів (DTO, Service, Guard, Prisma), а результати експортує через класи/функції.
 * ПОТІК ДАНИХ: запит -> Controller -> Service -> Prisma/БД -> відповідь клієнту.
 * ПОНЯТТЯ:
 * - NestJS: фреймворк для серверних застосунків на Node.js із модульною архітектурою.
 * - Controller: приймає HTTP-запити і передає їх у сервіс.
 * - Service: містить бізнес-логіку, валідацію, обчислення.
 * - DTO (Data Transfer Object): контракт форми даних для входу/виходу.
 * - Guard: перевіряє доступ до маршруту (автентифікація/ролі).
 * - Prisma: ORM для читання/запису даних у БД через типізований API.
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
