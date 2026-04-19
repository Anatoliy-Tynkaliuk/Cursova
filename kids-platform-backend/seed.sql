INSERT INTO age_groups (code, title, min_age, max_age, sort_order, is_active)
VALUES
  ('4_5', '4–5 років', 4, 5, 1, true),
  ('6_8', '6–8 років', 6, 8, 2, true),
  ('9_12', '9–12 років', 9, 12, 3, true);

INSERT INTO modules (code, title, description, icon, is_active)
VALUES
  ('logic', 'Логіка', 'Ігри на мислення та памʼять', '🧩', true),
  ('math', 'Математика', 'Рахунок та базові математичні навички', '➕', true),
  ('english', 'Англійська', 'Слова та базова лексика', '🔤', true);

INSERT INTO game_types (code, title, description, icon, is_active)
VALUES
  ('multiple_choice', 'Вибір відповіді', 'Одна правильна відповідь', '✅', true),
  ('text_input', 'Текстова відповідь', 'Введення слова або числа', '⌨️', true);

INSERT INTO games (module_id, game_type_id, title, description, min_age_group_id, difficulty, is_active)
VALUES
  (
    (SELECT id FROM modules WHERE code = 'logic'),
    (SELECT id FROM game_types WHERE code = 'multiple_choice'),
    'Знайди зайвий предмет',
    'Визнач, який предмет не підходить до набору.',
    (SELECT id FROM age_groups WHERE code = '4_5'),
    1,
    true
  ),
  (
    (SELECT id FROM modules WHERE code = 'math'),
    (SELECT id FROM game_types WHERE code = 'text_input'),
    'Порахуй предмети',
    'Порахуй кількість предметів на картинці.',
    (SELECT id FROM age_groups WHERE code = '6_8'),
    2,
    true
  ),
  (
    (SELECT id FROM modules WHERE code = 'english'),
    (SELECT id FROM game_types WHERE code = 'multiple_choice'),
    'Вибери переклад',
    'Вибери правильний переклад слова.',
    (SELECT id FROM age_groups WHERE code = '6_8'),
    1,
    true
  );

INSERT INTO tasks (game_id, position, is_active)
VALUES
  ((SELECT id FROM games WHERE title = 'Знайди зайвий предмет'), 1, true),
  ((SELECT id FROM games WHERE title = 'Знайди зайвий предмет'), 2, true),
  ((SELECT id FROM games WHERE title = 'Порахуй предмети'), 1, true),
  ((SELECT id FROM games WHERE title = 'Порахуй предмети'), 2, true),
  ((SELECT id FROM games WHERE title = 'Вибери переклад'), 1, true),
  ((SELECT id FROM games WHERE title = 'Вибери переклад'), 2, true);

INSERT INTO task_versions (task_id, version, prompt, data_json, correct_json, explanation, difficulty, is_current)
VALUES
  (
    (SELECT id FROM tasks WHERE game_id = (SELECT id FROM games WHERE title = 'Знайди зайвий предмет') AND position = 1),
    1,
    'Який предмет зайвий?',
    '{"options":["яблуко","банан","мʼяч","груша"]}'::jsonb,
    '{"answer":"мʼяч"}'::jsonb,
    'Мʼяч — не фрукт.',
    1,
    true
  ),
  (
    (SELECT id FROM tasks WHERE game_id = (SELECT id FROM games WHERE title = 'Знайди зайвий предмет') AND position = 2),
    1,
    'Який предмет не підходить?',
    '{"options":["кіт","собака","корова","літак"]}'::jsonb,
    '{"answer":"літак"}'::jsonb,
    'Літак — не тварина.',
    1,
    true
  ),
  (
    (SELECT id FROM tasks WHERE game_id = (SELECT id FROM games WHERE title = 'Порахуй предмети') AND position = 1),
    1,
    'Скільки яблук на картинці?',
    '{"image":"apples.png"}'::jsonb,
    '{"answer":4}'::jsonb,
    'Правильна відповідь: 4.',
    2,
    true
  ),
  (
    (SELECT id FROM tasks WHERE game_id = (SELECT id FROM games WHERE title = 'Порахуй предмети') AND position = 2),
    1,
    'Скільки зірок на картинці?',
    '{"image":"stars.png"}'::jsonb,
    '{"answer":7}'::jsonb,
    'Правильна відповідь: 7.',
    2,
    true
  ),
  (
    (SELECT id FROM tasks WHERE game_id = (SELECT id FROM games WHERE title = 'Вибери переклад') AND position = 1),
    1,
    'Слово "cat" означає…',
    '{"options":["кіт","собака","корова","птах"]}'::jsonb,
    '{"answer":"кіт"}'::jsonb,
    'Cat — це кіт.',
    1,
    true
  ),
  (
    (SELECT id FROM tasks WHERE game_id = (SELECT id FROM games WHERE title = 'Вибери переклад') AND position = 2),
    1,
    'Слово "book" означає…',
    '{"options":["книга","ручка","стіл","вікно"]}'::jsonb,
    '{"answer":"книга"}'::jsonb,
    'Book — це книга.',
    1,
    true
  );

INSERT INTO badges (code, title, description, icon)
VALUES
  ('first_game', 'Перший крок', 'Пройди першу гру', '🏅'),
  ('math_star', 'Зірка математики', 'Отримай 5 правильних відповідей у математиці', '⭐'),
  ('logic_master', 'Майстер логіки', 'Пройди логічний модуль без помилок', '🧠');
