export type AchievementMetricKey =
  | "finished_games"
  | "total_stars"
  | "login_days"
  | "correct_answers"
  | "total_attempts"
  | "perfect_games";

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

const METRIC_META: Record<AchievementMetricKey, { label: string; getter: (m: AchievementMetrics) => number }> = {
  finished_games: { label: "Пройдено ігор", getter: (m) => m.finishedAttempts },
  total_stars: { label: "Зароблено зірок", getter: (m) => m.totalStars },
  login_days: { label: "Днів активності", getter: (m) => m.loginDays },
  correct_answers: { label: "Правильних відповідей", getter: (m) => m.correctAnswers },
  total_attempts: { label: "Усього спроб", getter: (m) => m.totalAttempts },
  perfect_games: { label: "Ідеальних ігор", getter: (m) => m.perfectGames },
};

const CODE_ALIASES: Record<string, AchievementMetricKey> = {
  FINISHED: "finished_games",
  FINISHED_GAMES: "finished_games",
  GAMES_COMPLETED: "finished_games",
  STARS: "total_stars",
  TOTAL_STARS: "total_stars",
  LOGIN_DAYS: "login_days",
  DAILY_LOGINS: "login_days",
  CORRECT_ANSWERS: "correct_answers",
  ATTEMPTS: "total_attempts",
  TOTAL_ATTEMPTS: "total_attempts",
  PERFECT_GAMES: "perfect_games",
};

export function buildAchievementRule(code: string, metrics: AchievementMetrics): AchievementRule | null {
  const match = code.trim().toUpperCase().match(/^([A-Z_]+)_(\d+)$/);
  if (!match) return null;

  const codeMetric = match[1];
  const targetValue = Number(match[2]);
  if (!Number.isFinite(targetValue) || targetValue <= 0) return null;

  const metricKey = CODE_ALIASES[codeMetric];
  if (!metricKey) return null;

  const metricMeta = METRIC_META[metricKey];
  const currentValue = metricMeta.getter(metrics);
  const progressPercent = Math.max(0, Math.min(100, Math.round((currentValue / targetValue) * 100)));

  return {
    metricKey,
    metricLabel: metricMeta.label,
    targetValue,
    currentValue,
    progressPercent,
  };
}