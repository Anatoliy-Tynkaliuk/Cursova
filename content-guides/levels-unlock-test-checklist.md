# Checklist тестів: "Рівень 1 → unlock рівень 2"

## Передумови
- Є `game_levels` для обраної гри на `difficulty=1` (мінімум рівень 1 і 2).
- Для кожного рівня є задачі (`tasks.levelId`) з `task_versions.isCurrent=true` і `difficulty=1`.
- У дитини немає старого прогресу для цієї гри/складності (або створена нова дитина).

## A. Початковий стан рівнів
1. Викликати:
   - `GET /games/:gameId/levels?difficulty=1&childProfileId=:childId`
2. Перевірити:
   - `maxUnlockedLevel = 1`
   - `level 1` має `state=unlocked`
   - `level 2` має `state=locked`

## B. Проходження рівня 1
1. Старт:
   - `POST /attempts/start` з `childProfileId`, `gameId`, `difficulty=1`, `level=1`
2. Відповісти на всі задачі рівня 1 правильними/валідними відповідями.
3. На останній відповіді отримати `finished=true`.

## C. Перевірка unlock після завершення
1. Повторно викликати:
   - `GET /games/:gameId/levels?difficulty=1&childProfileId=:childId`
2. Перевірити:
   - `maxUnlockedLevel = 2`
   - `level 1` має `state=completed`
   - `level 2` має `state=unlocked`

## D. Негативні кейси
1. Спроба старту заблокованого рівня (наприклад, level 3 до unlock):
   - очікуємо `400` + повідомлення, що рівень заблокований.
2. Спроба старту з неіснуючим `levelId`:
   - очікуємо `404`.
3. Спроба старту з одночасними `level` і `levelId`:
   - очікуємо `400`.

## E. Регресія
- Повторний прохід already completed рівня не має "закривати" unlock назад.
- `maxUnlockedLevel` має тільки зростати або лишатися незмінним.
- Після перезапуску сервера стан unlock зберігається (бо з БД, не з in-memory).

## F. SQL-перевірка прогресу
```sql
SELECT "childProfileId", "gameId", "difficulty", "maxUnlockedLevel", "updatedAt"
FROM child_level_progress
WHERE "childProfileId" = :childId AND "gameId" = :gameId AND "difficulty" = 1;
```

Очікування після проходження level 1:
- є рядок у `child_level_progress`
- `maxUnlockedLevel >= 2`
