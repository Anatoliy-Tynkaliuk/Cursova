-- =============================================================
-- bootstrap_game_levels.sql
-- Масове створення рівнів для всіх активних ігор.
--
-- Логіка:
-- 1) Для кожної активної гри створюємо рівні 1..N для difficulty 1..3.
-- 2) Не створюємо дублікати (ON CONFLICT).
--
-- Параметри (змінюй під себе):
--   total_levels_per_difficulty = 10
-- =============================================================

BEGIN;

WITH settings AS (
  SELECT 10::int AS total_levels_per_difficulty
),
source_rows AS (
  SELECT
    g.id AS game_id,
    d.difficulty,
    lvl.level_number,
    format('Рівень %s (Складність %s)', lvl.level_number, d.difficulty) AS title
  FROM games g
  CROSS JOIN (VALUES (1), (2), (3)) AS d(difficulty)
  CROSS JOIN settings s
  CROSS JOIN LATERAL generate_series(1, s.total_levels_per_difficulty) AS lvl(level_number)
  WHERE g."isActive" = true
),
inserted AS (
  INSERT INTO game_levels (
    "gameId",
    "difficulty",
    "levelNumber",
    "title",
    "isActive",
    "createdAt",
    "updatedAt",
    "deletedAt"
  )
  SELECT
    sr.game_id,
    sr.difficulty,
    sr.level_number,
    sr.title,
    true,
    NOW(),
    NOW(),
    NULL
  FROM source_rows sr
  ON CONFLICT ("gameId", "difficulty", "levelNumber") DO NOTHING
  RETURNING 1
)
SELECT COUNT(*) AS inserted_levels FROM inserted;

COMMIT;

-- ПЕРЕВІРКА:
-- SELECT "gameId", "difficulty", COUNT(*)
-- FROM game_levels
-- WHERE "isActive" = true AND "deletedAt" IS NULL
-- GROUP BY "gameId", "difficulty"
-- ORDER BY "gameId", "difficulty";
