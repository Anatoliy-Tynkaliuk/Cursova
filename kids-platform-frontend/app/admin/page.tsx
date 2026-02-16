"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createAdminGame,
  createAdminGameLevel,
  createAdminAgeGroup,
  createAdminBadge,
  createAdminTask,
  createAdminTaskVersion,
  deleteAdminAgeGroup,
  deleteAdminBadge,
  deleteAdminGame,
  deleteAdminGameLevel,
  deleteAdminTask,
  deleteAdminTaskVersion,
  getAdminAgeGroups,
  getAdminBadges,
  getAdminGames,
  getAdminGameLevels,
  getAdminGameTypes,
  getAdminModules,
  getAdminTasks,
  getAdminTaskVersions,
  updateAdminBadge,
  updateAdminGame,
  updateAdminGameLevel,
  updateAdminAgeGroup,
  updateAdminTask,
  updateAdminTaskVersion,
  type AdminAgeGroupItem,
  type AdminBadgeItem,
  type AdminGameItem,
  type AdminGameLevelItem,
  type AdminGameTypeItem,
  type AdminModuleItem,
  type AdminTaskItem,
  type AdminTaskVersionItem,
} from "@/lib/endpoints";
import { isLoggedIn } from "@/lib/auth";
import styles from "./admin.module.css";

export default function AdminPage() {
  const parseSelectNumber = (value: string): number | "" => (value === "" ? "" : Number(value));

  const [modules, setModules] = useState<AdminModuleItem[]>([]);
  const [gameTypes, setGameTypes] = useState<AdminGameTypeItem[]>([]);
  const [ageGroups, setAgeGroups] = useState<AdminAgeGroupItem[]>([]);
  const [games, setGames] = useState<AdminGameItem[]>([]);
  const [gameLevels, setGameLevels] = useState<AdminGameLevelItem[]>([]);
  const [tasks, setTasks] = useState<AdminTaskItem[]>([]);
  const [taskVersions, setTaskVersions] = useState<AdminTaskVersionItem[]>([]);
  const [badges, setBadges] = useState<AdminBadgeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [ageGroupCode, setAgeGroupCode] = useState("");
  const [ageGroupTitle, setAgeGroupTitle] = useState("");
  const [ageGroupMinAge, setAgeGroupMinAge] = useState(3);
  const [ageGroupMaxAge, setAgeGroupMaxAge] = useState(5);
  const [ageGroupSortOrder, setAgeGroupSortOrder] = useState(1);
  const [ageGroupIsActive, setAgeGroupIsActive] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [moduleId, setModuleId] = useState<number | "">("");
  const [gameTypeId, setGameTypeId] = useState<number | "">("");
  const [minAgeGroupId, setMinAgeGroupId] = useState<number | "">("");
  const [difficulty, setDifficulty] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const [levelGameId, setLevelGameId] = useState<number | "">("");
  const [levelDifficulty, setLevelDifficulty] = useState(1);
  const [levelNumberInput, setLevelNumberInput] = useState<string>("");
  const [levelTitle, setLevelTitle] = useState("");
  const [levelIsActive, setLevelIsActive] = useState(true);

  const [taskGameId, setTaskGameId] = useState<number | "">("");
  const [taskLevelId, setTaskLevelId] = useState<number | "">("");
  const [taskPosition, setTaskPosition] = useState(1);
  const [taskIsActive, setTaskIsActive] = useState(true);

  const [taskId, setTaskId] = useState<number | "">("");
  const [taskVersion, setTaskVersion] = useState(1);
  const [taskPrompt, setTaskPrompt] = useState("");
  const [testOptionsText, setTestOptionsText] = useState("");
  const [testCorrectAnswer, setTestCorrectAnswer] = useState("");
  const [dragItemsText, setDragItemsText] = useState("");
  const [dragTargetsText, setDragTargetsText] = useState("");
  const [dragPairsText, setDragPairsText] = useState("");
  const [taskDataJson, setTaskDataJson] = useState("{\"options\":[]}");
  const [taskCorrectJson, setTaskCorrectJson] = useState("{\"answer\":\"\"}");
  const [taskExplanation, setTaskExplanation] = useState("");
  const [taskDifficulty, setTaskDifficulty] = useState(1);
  const [taskIsCurrent, setTaskIsCurrent] = useState(true);

  const [badgeCode, setBadgeCode] = useState("");
  const [badgeTitle, setBadgeTitle] = useState("");
  const [badgeDescription, setBadgeDescription] = useState("");
  const [badgeIcon, setBadgeIcon] = useState("");

  const ageGroupFormValid =
    ageGroupCode.trim().length > 0 &&
    ageGroupTitle.trim().length > 0 &&
    ageGroupMinAge >= 0 &&
    ageGroupMaxAge >= ageGroupMinAge;
  const formValid =
    title.trim().length > 0 &&
    moduleId !== "" &&
    gameTypeId !== "" &&
    minAgeGroupId !== "";

  const levelFormValid = levelGameId !== "" && levelTitle.trim().length > 0 && [1, 2, 3].includes(levelDifficulty);
  const levelsByGameDifficulty = useMemo(() => {
    return gameLevels.reduce<Record<string, number>>((acc, level) => {
      const key = `${level.gameId}:${level.difficulty}`;
      if (level.isActive && !level.deletedAt) {
        acc[key] = (acc[key] ?? 0) + 1;
      }
      return acc;
    }, {});
  }, [gameLevels]);

  const selectedTaskGameLevels = useMemo(
    () => (taskGameId === "" ? [] : gameLevels.filter((level) => level.gameId === taskGameId && level.isActive && !level.deletedAt)),
    [gameLevels, taskGameId],
  );

  const taskRequiresLevel = selectedTaskGameLevels.length > 0;
  const taskFormValid = taskGameId !== "" && taskPosition > 0 && (!taskRequiresLevel || taskLevelId !== "");

  const selectedTask = useMemo(
    () => (taskId === "" ? null : tasks.find((item) => item.id === taskId) ?? null),
    [taskId, tasks],
  );

  const selectedTaskGame = useMemo(
    () => (selectedTask ? games.find((item) => item.id === selectedTask.gameId) ?? null : null),
    [games, selectedTask],
  );
  const linkedTaskDifficulty = selectedTask?.difficulty ?? null;

  const selectedTaskTypeCode = (selectedTaskGame?.gameTypeCode ?? "").toLowerCase();
  const isTestTaskType = selectedTaskTypeCode === "test";
  const isDragTaskType = selectedTaskTypeCode === "drag";

  const taskVersionFormValid = taskId !== "" && taskPrompt.trim().length > 0;
  const badgeFormValid = badgeCode.trim().length > 0 && badgeTitle.trim().length > 0;

  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = "/login";
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [
          modulesData,
          gameTypesData,
          ageGroupsData,
          gamesData,
          gameLevelsData,
          tasksData,
          taskVersionsData,
          badgesData,
        ] = await Promise.all([
          getAdminModules(),
          getAdminGameTypes(),
          getAdminAgeGroups(),
          getAdminGames(),
          getAdminGameLevels(),
          getAdminTasks(),
          getAdminTaskVersions(),
          getAdminBadges(),
        ]);
        setModules(modulesData);
        setGameTypes(gameTypesData);
        setAgeGroups(ageGroupsData);
        setGames(gamesData);
        setGameLevels(gameLevelsData);
        setTasks(tasksData);
        setTaskVersions(taskVersionsData);
        setBadges(badgesData);
      } catch (e: any) {
        setError(e.message ?? "Error");
      } finally {
        setLoading(false);
      }
    }

    load().catch((e: any) => setError(e.message ?? "Error"));
  }, []);

  useEffect(() => {
    if (gameTypeId === "" && gameTypes.length > 0) {
      const preferred = gameTypes.find((item) => item.code.toLowerCase() === "test") ?? gameTypes[0];
      setGameTypeId(preferred.id);
    }
  }, [gameTypeId, gameTypes]);

  const groupedTasks = useMemo(() => {
    return tasks.reduce<Record<number, AdminTaskItem[]>>((acc, task) => {
      acc[task.gameId] = acc[task.gameId] ? [...acc[task.gameId], task] : [task];
      return acc;
    }, {});
  }, [tasks]);

  const groupedTaskVersions = useMemo(() => {
    return taskVersions.reduce<Record<number, AdminTaskVersionItem[]>>((acc, version) => {
      acc[version.taskId] = acc[version.taskId] ? [...acc[version.taskId], version] : [version];
      return acc;
    }, {});
  }, [taskVersions]);

  const nextPositionForGame = useMemo(() => {
    if (taskGameId === "") return 1;
    const list = groupedTasks[taskGameId] ?? [];
    if (list.length === 0) return 1;
    return Math.max(...list.map((t) => t.position)) + 1;
  }, [groupedTasks, taskGameId]);

  const nextLevelNumberForSelection = useMemo(() => {
    if (levelGameId === "") return 1;

    const levels = gameLevels.filter(
      (level) => level.gameId === levelGameId && level.difficulty === levelDifficulty,
    );

    if (levels.length === 0) return 1;
    return Math.max(...levels.map((level) => level.levelNumber)) + 1;
  }, [gameLevels, levelDifficulty, levelGameId]);

  const taskPositionTaken = useMemo(() => {
    if (taskGameId === "") return false;
    const list = groupedTasks[taskGameId] ?? [];
    return list.some((t) => t.position === taskPosition);
  }, [groupedTasks, taskGameId, taskPosition]);

  useEffect(() => {
    if (linkedTaskDifficulty !== null) {
      setTaskDifficulty(linkedTaskDifficulty);
    }
  }, [linkedTaskDifficulty]);

  async function onCreateAgeGroup() {
    if (!ageGroupFormValid) return;
    setError(null);
    setMessage(null);
    try {
      await createAdminAgeGroup({
        code: ageGroupCode.trim(),
        title: ageGroupTitle.trim(),
        minAge: ageGroupMinAge,
        maxAge: ageGroupMaxAge,
        sortOrder: ageGroupSortOrder,
        isActive: ageGroupIsActive,
      });
      setMessage("Вікову групу створено.");
      setAgeGroupCode("");
      setAgeGroupTitle("");
      setAgeGroupMinAge(3);
      setAgeGroupMaxAge(5);
      setAgeGroupSortOrder(1);
      setAgeGroupIsActive(true);
      const ageGroupsData = await getAdminAgeGroups();
      setAgeGroups(ageGroupsData);
    } catch (e: any) {
      setError(e.message ?? "Error");
    }
  }

  async function onUpdateAgeGroup(group: AdminAgeGroupItem) {
    setError(null);
    setMessage(null);
    try {
      await updateAdminAgeGroup(group.id, {
        code: group.code,
        title: group.title,
        minAge: group.minAge,
        maxAge: group.maxAge,
        sortOrder: group.sortOrder,
        isActive: group.isActive,
      });
      setMessage("Вікову групу оновлено.");
    } catch (e: any) {
      setError(e.message ?? "Error");
    }
  }

  async function onDeleteAgeGroup(groupId: number) {
    setError(null);
    setMessage(null);
    try {
      await deleteAdminAgeGroup(groupId);
      setMessage("Вікову групу видалено.");
      setAgeGroups((prev) => prev.filter((group) => group.id !== groupId));
    } catch (e: any) {
      setError(e.message ?? "Error");
    }
  }

  async function onCreateGame() {
    if (!formValid || typeof moduleId !== "number" || typeof gameTypeId !== "number" || typeof minAgeGroupId !== "number") return;
    setError(null);
    setMessage(null);
    try {
      const createdGame = await createAdminGame({
        moduleId,
        gameTypeId,
        minAgeGroupId,
        title: title.trim(),
        description: description.trim() || undefined,
        difficulty,
        isActive,
      });
      setMessage("Гру створено.");
      setTitle("");
      setDescription("");
      setDifficulty(1);
      setLevelGameId(createdGame.id);
      const gamesData = await getAdminGames();
      setGames(gamesData);
    } catch (e: any) {
      setError(e.message ?? "Error");
    }
  }

  async function onUpdateGame(game: AdminGameItem) {
    setError(null);
    setMessage(null);
    try {
      await updateAdminGame(game.id, {
        title: game.title,
        description: game.description ?? undefined,
        difficulty: game.difficulty,
        isActive: game.isActive,
      });
      setMessage("Гру оновлено.");
    } catch (e: any) {
      setError(e.message ?? "Error");
    }
  }

  async function onDeleteGame(gameId: number) {
    setError(null);
    setMessage(null);
    try {
      await deleteAdminGame(gameId);
      setMessage("Гру видалено.");
      setGames((prev) => prev.filter((g) => g.id !== gameId));
    } catch (e: any) {
      setError(e.message ?? "Error");
    }
  }

  async function onCreateGameLevel() {
    if (!levelFormValid || typeof levelGameId !== "number") return;

    const parsedLevelNumber = levelNumberInput.trim() === "" ? undefined : Number(levelNumberInput);
    if (parsedLevelNumber !== undefined && (!Number.isInteger(parsedLevelNumber) || parsedLevelNumber < 1)) {
      setError("Номер рівня має бути цілим числом більше 0.");
      return;
    }

    if (parsedLevelNumber !== undefined && parsedLevelNumber < nextLevelNumberForSelection) {
      const confirmed = window.confirm(
        `Ви обрали номер ${parsedLevelNumber}, хоча наступний автоматичний — ${nextLevelNumberForSelection}. Продовжити?`,
      );

      if (!confirmed) return;
    }

    setError(null);
    setMessage(null);
    try {
      await createAdminGameLevel({
        gameId: levelGameId,
        difficulty: levelDifficulty,
        levelNumber: parsedLevelNumber,
        title: levelTitle.trim(),
        isActive: levelIsActive,
      });

      setMessage("Рівень створено.");
      setLevelNumberInput("");
      setLevelTitle("");
      setLevelDifficulty(1);
      setLevelIsActive(true);

      const levelsData = await getAdminGameLevels();
      setGameLevels(levelsData);
    } catch (e: any) {
      setError(e.message ?? "Error");
    }
  }

  async function onUpdateGameLevel(level: AdminGameLevelItem) {
    setError(null);
    setMessage(null);
    try {
      await updateAdminGameLevel(level.id, {
        title: level.title,
        levelNumber: level.levelNumber,
        isActive: level.isActive,
      });
      setMessage("Рівень оновлено.");
    } catch (e: any) {
      setError(e.message ?? "Error");
    }
  }

  async function onDeleteGameLevel(levelId: number) {
    const confirmed = window.confirm("Видалити рівень повністю разом із завданнями цього рівня?");
    if (!confirmed) return;

    setError(null);
    setMessage(null);
    try {
      await deleteAdminGameLevel(levelId);
      setMessage("Рівень видалено.");
      const [levelsData, tasksData] = await Promise.all([
        getAdminGameLevels(),
        getAdminTasks(),
      ]);
      setGameLevels(levelsData);
      setTasks(tasksData);
      const taskVersionsData = await getAdminTaskVersions();
      setTaskVersions(taskVersionsData);
    } catch (e: any) {
      setError(e.message ?? "Error");
    }
  }

  async function onCreateTask() {
    if (!taskFormValid || typeof taskGameId !== "number") return;
    if (taskPositionTaken) {
      setError(`Для цієї гри вже є завдання з позицією ${taskPosition}.`);
      return;
    }
    setError(null);
    setMessage(null);
    try {
      await createAdminTask({
        gameId: taskGameId,
        levelId: taskLevelId === "" ? undefined : taskLevelId,
        position: taskPosition,
        isActive: taskIsActive,
      });
      setMessage("Завдання створено.");
      setTaskPosition(1);
      setTaskLevelId("");
      const tasksData = await getAdminTasks();
      setTasks(tasksData);
    } catch (e: any) {
      setError(e.message ?? "Error");
    }
  }

  async function onUpdateTask(task: AdminTaskItem) {
    setError(null);
    setMessage(null);
    try {
      await updateAdminTask(task.id, {
        levelId: task.levelId,
        position: task.position,
        isActive: task.isActive,
      });
      setMessage("Завдання оновлено.");
    } catch (e: any) {
      setError(e.message ?? "Error");
    }
  }

  async function onDeleteTask(taskIdToDelete: number) {
    setError(null);
    setMessage(null);
    try {
      await deleteAdminTask(taskIdToDelete);
      setMessage("Завдання видалено.");
      setTasks((prev) => prev.filter((t) => t.id !== taskIdToDelete));
      setTaskVersions((prev) => prev.filter((v) => v.taskId !== taskIdToDelete));
    } catch (e: any) {
      setError(e.message ?? "Error");
    }
  }

  async function onCreateTaskVersion() {
    if (!taskVersionFormValid || typeof taskId !== "number") return;
    setError(null);
    setMessage(null);
    try {
      let dataJson: unknown = {};
      let correctJson: unknown = {};

      if (isTestTaskType) {
        const options = testOptionsText
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean);

        if (options.length < 2) {
          throw new Error("Для тесту додай мінімум 2 варіанти відповіді");
        }

        if (!testCorrectAnswer.trim()) {
          throw new Error("Для тесту вкажи правильну відповідь");
        }

        dataJson = { options };
        correctJson = { answer: testCorrectAnswer.trim() };
      } else if (isDragTaskType) {
        const items = dragItemsText
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean);
        const targets = dragTargetsText
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean);
        const pairs = dragPairsText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const [item, target] = line.split("=>").map((value) => value.trim());
            if (!item || !target) {
              throw new Error("Пари для перетягування заповнюй у форматі: елемент => ціль");
            }
            return { item, target };
          });

        if (items.length === 0 || targets.length === 0 || pairs.length === 0) {
          throw new Error("Для перетягування додай елементи, цілі та відповідності");
        }

        dataJson = { items, targets };
        correctJson = { pairs };
      } else {
        dataJson = taskDataJson.trim() ? JSON.parse(taskDataJson) : {};
        correctJson = taskCorrectJson.trim() ? JSON.parse(taskCorrectJson) : {};
      }

      await createAdminTaskVersion({
        taskId,
        version: taskVersion,
        prompt: taskPrompt.trim(),
        dataJson,
        correctJson,
        explanation: taskExplanation.trim() || undefined,
        difficulty: taskDifficulty,
        isCurrent: taskIsCurrent,
      });
      setMessage("Версію завдання створено.");
      setTaskPrompt("");
      setTestOptionsText("");
      setTestCorrectAnswer("");
      setDragItemsText("");
      setDragTargetsText("");
      setDragPairsText("");
      setTaskDataJson("{\"options\":[]}");
      setTaskCorrectJson("{\"answer\":\"\"}");
      setTaskExplanation("");
      setTaskDifficulty(1);
      const taskVersionsData = await getAdminTaskVersions();
      setTaskVersions(taskVersionsData);
    } catch (e: any) {
      setError(e.message ?? "Помилка створення версії завдання");
    }
  }


  async function onUpdateTaskVersion(version: AdminTaskVersionItem) {
    setError(null);
    setMessage(null);
    try {
      await updateAdminTaskVersion(version.id, {
        prompt: version.prompt,
        dataJson: version.dataJson,
        correctJson: version.correctJson,
        explanation: version.explanation ?? undefined,
        difficulty: version.difficulty,
        isCurrent: version.isCurrent,
      });
      setMessage("Версію завдання оновлено.");
    } catch (e: any) {
      setError(e.message ?? "Error");
    }
  }

  async function onDeleteTaskVersion(taskVersionId: number) {
    setError(null);
    setMessage(null);
    try {
      await deleteAdminTaskVersion(taskVersionId);
      setMessage("Версію завдання видалено.");
      setTaskVersions((prev) => prev.filter((v) => v.id !== taskVersionId));
    } catch (e: any) {
      setError(e.message ?? "Error");
    }
  }

  async function onCreateBadge() {
    if (!badgeFormValid) return;
    setError(null);
    setMessage(null);
    try {
      await createAdminBadge({
        code: badgeCode.trim(),
        title: badgeTitle.trim(),
        description: badgeDescription.trim() || undefined,
        icon: badgeIcon.trim() || undefined,
      });
      setMessage("Бейдж створено.");
      setBadgeCode("");
      setBadgeTitle("");
      setBadgeDescription("");
      setBadgeIcon("");
      const badgesData = await getAdminBadges();
      setBadges(badgesData);
    } catch (e: any) {
      setError(e.message ?? "Error");
    }
  }

  async function onUpdateBadge(badge: AdminBadgeItem) {
    setError(null);
    setMessage(null);
    try {
      await updateAdminBadge(badge.id, {
        code: badge.code,
        title: badge.title,
        description: badge.description ?? undefined,
        icon: badge.icon ?? undefined,
      });
      setMessage("Бейдж оновлено.");
    } catch (e: any) {
      setError(e.message ?? "Error");
    }
  }

  async function onDeleteBadge(badgeId: number) {
    setError(null);
    setMessage(null);
    try {
      await deleteAdminBadge(badgeId);
      setMessage("Бейдж видалено.");
      setBadges((prev) => prev.filter((badge) => badge.id !== badgeId));
    } catch (e: any) {
      setError(e.message ?? "Error");
    }
  }

  return (
    <div className={styles.page}>
      <h1>Адмінка контенту</h1>
      {loading && <p>Завантаження...</p>}
      {error && <p className={styles.errorText}>{error}</p>}
      {message && <p className={styles.successText}>{message}</p>}

      <section className={styles.sectionCard}>
        <h2>Додати вікову групу</h2>
        <div className={styles.formGrid}>
          <input
            placeholder="Код (наприклад 6_8)"
            value={ageGroupCode}
            onChange={(e) => setAgeGroupCode(e.target.value)}
          />
          <input
            placeholder="Назва"
            value={ageGroupTitle}
            onChange={(e) => setAgeGroupTitle(e.target.value)}
          />
          <label className={styles.inlineLabel}>
            Мін. вік
            <input
              type="number"
              min={0}
              value={ageGroupMinAge}
              onChange={(e) => setAgeGroupMinAge(Number(e.target.value))}
              className={styles.smallInput}
            />
          </label>
          <label className={styles.inlineLabel}>
            Макс. вік
            <input
              type="number"
              min={0}
              value={ageGroupMaxAge}
              onChange={(e) => setAgeGroupMaxAge(Number(e.target.value))}
              className={styles.smallInput}
            />
          </label>
          <label className={styles.inlineLabel}>
            Порядок
            <input
              type="number"
              min={1}
              value={ageGroupSortOrder}
              onChange={(e) => setAgeGroupSortOrder(Number(e.target.value))}
              className={styles.smallInput}
            />
          </label>
          <label className={styles.inlineLabel}>
            <input
              type="checkbox"
              checked={ageGroupIsActive}
              onChange={(e) => setAgeGroupIsActive(e.target.checked)}
            />
            Активна
          </label>
          <button disabled={!ageGroupFormValid} onClick={onCreateAgeGroup}>
            Створити вікову групу
          </button>
        </div>
      </section>

      <section className={styles.sectionCard}>
        <h2>Додати гру</h2>
        <div className={styles.formGrid}>
          <input
            placeholder="Назва гри"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Опис (необов'язково)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          <select value={moduleId} onChange={(e) => setModuleId(parseSelectNumber(e.target.value))}>
            <option value="">Модуль</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
          <select value={gameTypeId} onChange={(e) => setGameTypeId(parseSelectNumber(e.target.value))}>
            <option value="">Тип гри</option>
            {gameTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.title}
              </option>
            ))}
          </select>
          <select value={minAgeGroupId} onChange={(e) => setMinAgeGroupId(parseSelectNumber(e.target.value))}>
            <option value="">Вікова група</option>
            {ageGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
          <label className={styles.inlineLabel}>
            Складність
            <input
              type="number"
              min={1}
              max={3}
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className={styles.smallInput}
            />
          </label>
          <label className={styles.inlineLabel}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Активна
          </label>
          <button
            disabled={!formValid}
            onClick={onCreateGame}
          >
            Створити гру
          </button>
        </div>
      </section>

      <section className={styles.sectionCard}>
        <h2>Додати рівень гри</h2>
        <div className={styles.formGrid}>
          <select
            value={levelGameId}
            onChange={(e) => {
              const value = e.target.value;
              setLevelGameId(value ? Number(value) : "");
            }}
          >
            <option value="">Гра</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
          <label className={styles.inlineLabel}>
            Складність
            <select value={levelDifficulty} onChange={(e) => setLevelDifficulty(Number(e.target.value))}>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </label>
          <input
            placeholder="Назва рівня"
            value={levelTitle}
            onChange={(e) => setLevelTitle(e.target.value)}
          />
          <label className={styles.inlineLabel}>
            Номер (опц.)
            <input
              type="number"
              min={1}
              value={levelNumberInput}
              onChange={(e) => setLevelNumberInput(e.target.value)}
              placeholder={String(nextLevelNumberForSelection)}
              className={styles.smallInput}
            />
          </label>
          <label className={styles.inlineLabel}>
            <input
              type="checkbox"
              checked={levelIsActive}
              onChange={(e) => setLevelIsActive(e.target.checked)}
            />
            Активний
          </label>
          <button disabled={!levelFormValid} onClick={onCreateGameLevel}>
            Створити рівень
          </button>
        </div>
      </section>

      <section className={styles.sectionSpacing}>
        <h2>Рівні ігор</h2>
        {gameLevels.length === 0 ? (
          <p>Немає рівнів.</p>
        ) : (
          <ul className={styles.listGrid}>
            {gameLevels.map((level) => (
              <li key={level.id} className={styles.listItem}>
                <div className={styles.metaText}>
                  {level.gameTitle} • D{level.difficulty}
                </div>
                <div className={styles.editGrid}>
                  <input
                    value={level.title}
                    onChange={(e) =>
                      setGameLevels((prev) =>
                        prev.map((item) =>
                          item.id === level.id ? { ...item, title: e.target.value } : item
                        )
                      )
                    }
                  />
                  <label className={styles.inlineLabel}>
                    Номер
                    <input
                      type="number"
                      min={1}
                      value={level.levelNumber}
                      onChange={(e) =>
                        setGameLevels((prev) =>
                          prev.map((item) =>
                            item.id === level.id
                              ? { ...item, levelNumber: Number(e.target.value) }
                              : item
                          )
                        )
                      }
                      className={styles.smallInputWide}
                    />
                  </label>
                  <label className={styles.inlineLabel}>
                    <input
                      type="checkbox"
                      checked={level.isActive}
                      onChange={(e) =>
                        setGameLevels((prev) =>
                          prev.map((item) =>
                            item.id === level.id ? { ...item, isActive: e.target.checked } : item
                          )
                        )
                      }
                    />
                    Активний
                  </label>
                  <div className={styles.actionsRow}>
                    <button onClick={() => onUpdateGameLevel(level)}>Зберегти</button>
                    <button onClick={() => onDeleteGameLevel(level.id)}>Видалити</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.sectionCard}>
        <h2>Додати завдання</h2>
        <div className={styles.helperText}>
          Кроки: 1) Обери гру. 2) Обери рівень для потрібної складності. 3) Створи завдання. 4) Нижче додай версію завдання — поля залежать від типу гри.
        </div>
        <div className={styles.formGrid}>
          <select
            value={taskGameId}
            onChange={(e) => {
              const value = Number(e.target.value);
              setTaskGameId(value);
              setTaskPosition(value ? nextPositionForGame : 1);
              setTaskLevelId("");
            }}
          >
            <option value="">Гра</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
          <select
            value={taskLevelId}
            onChange={(e) => {
              const value = e.target.value;
              setTaskLevelId(value ? Number(value) : "");
            }}
            disabled={taskGameId === ""}
          >
            <option value="">{taskRequiresLevel ? "Оберіть рівень" : "Без привʼязки до рівня"}</option>
            {selectedTaskGameLevels.map((level) => (
              <option key={level.id} value={level.id}>
                D{level.difficulty} • Рівень {level.levelNumber} — {level.title}
              </option>
            ))}
          </select>
          <label className={styles.inlineLabel}>
            Позиція
            <input
              type="number"
              min={1}
              value={taskPosition}
              onChange={(e) => setTaskPosition(Number(e.target.value))}
              className={styles.smallInput}
            />
          </label>
          <label className={styles.inlineLabel}>
            <input
              type="checkbox"
              checked={taskIsActive}
              onChange={(e) => setTaskIsActive(e.target.checked)}
            />
            Активне
          </label>
          <button disabled={!taskFormValid} onClick={onCreateTask}>
            Створити завдання
          </button>
          {taskPositionTaken && (
            <div style={{ fontSize: 12, color: "#b45309" }}>
              Для цієї гри вже є завдання з позицією {taskPosition}. Вибери іншу позицію.
            </div>
          )}
          {taskRequiresLevel && taskLevelId === "" && (
            <div style={{ fontSize: 12, color: "#b45309" }}>
              Для цієї гри вже налаштовані рівні — обери конкретний рівень.
            </div>
          )}
        </div>
      </section>

      <section className={styles.sectionCard}>
        <h2>Додати версію завдання</h2>
        <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
          <select
            value={taskId}
            onChange={(e) => {
              const value = e.target.value;
              setTaskId(value ? Number(value) : "");
            }}
          >
            <option value="">Завдання</option>
            {tasks.map((t) => {
              const game = games.find((item) => item.id === t.gameId);
              return (
                <option key={t.id} value={t.id}>
                  {t.gameTitle} ({game?.gameTypeCode ?? "unknown"}) — #{t.position}
                </option>
              );
            })}
          </select>

          {selectedTaskGame && (
            <div style={{ fontSize: 12, background: "#f5f5f5", borderRadius: 8, padding: 10 }}>
              Тип гри для цього завдання: <b>{selectedTaskGame.gameTypeCode}</b>.
              {isTestTaskType && " Заповни запитання, варіанти відповідей і правильну відповідь."}
              {isDragTaskType && " Заповни запитання, елементи для перетягування, цілі та відповідності."}
            </div>
          )}

          <label className={styles.inlineLabel}>
            Версія
            <input
              type="number"
              min={1}
              value={taskVersion}
              onChange={(e) => setTaskVersion(Number(e.target.value))}
              className={styles.smallInput}
            />
          </label>

          <input
            placeholder={isTestTaskType ? "Запитання тесту" : isDragTaskType ? "Інструкція для перетягування" : "Prompt"}
            value={taskPrompt}
            onChange={(e) => setTaskPrompt(e.target.value)}
          />

          {isTestTaskType && (
            <>
              <textarea
                placeholder={"Варіанти відповіді, кожен з нового рядка\nНаприклад:\n2+2=3\n2+2=4"}
                value={testOptionsText}
                onChange={(e) => setTestOptionsText(e.target.value)}
                rows={5}
              />
              <input
                placeholder="Правильна відповідь (точний текст)"
                value={testCorrectAnswer}
                onChange={(e) => setTestCorrectAnswer(e.target.value)}
              />
            </>
          )}

          {isDragTaskType && (
            <>
              <textarea
                placeholder={"Елементи для перетягування (кожен з нового рядка)"}
                value={dragItemsText}
                onChange={(e) => setDragItemsText(e.target.value)}
                rows={4}
              />
              <textarea
                placeholder={"Цілі (кожна з нового рядка)"}
                value={dragTargetsText}
                onChange={(e) => setDragTargetsText(e.target.value)}
                rows={4}
              />
              <textarea
                placeholder={"Правильні пари у форматі елемент => ціль\nНаприклад:\nЯблуко => Фрукт\nМорква => Овоч"}
                value={dragPairsText}
                onChange={(e) => setDragPairsText(e.target.value)}
                rows={5}
              />
            </>
          )}

          {!isTestTaskType && !isDragTaskType && (
            <>
              <textarea
                placeholder="dataJson (JSON)"
                value={taskDataJson}
                onChange={(e) => setTaskDataJson(e.target.value)}
                rows={4}
              />
              <textarea
                placeholder="correctJson (JSON)"
                value={taskCorrectJson}
                onChange={(e) => setTaskCorrectJson(e.target.value)}
                rows={3}
              />
            </>
          )}

          <input
            placeholder="Пояснення (необов'язково)"
            value={taskExplanation}
            onChange={(e) => setTaskExplanation(e.target.value)}
          />
          <label className={styles.inlineLabel}>
            Складність
            <input
              type="number"
              min={1}
              max={5}
              value={taskDifficulty}
              onChange={(e) => setTaskDifficulty(Number(e.target.value))}
              className={styles.smallInput}
              disabled={linkedTaskDifficulty !== null}
            />
          </label>
          {linkedTaskDifficulty !== null && (
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Для завдання з рівнем складність визначається автоматично: D{linkedTaskDifficulty}.
            </div>
          )}
          <label className={styles.inlineLabel}>
            <input
              type="checkbox"
              checked={taskIsCurrent}
              onChange={(e) => setTaskIsCurrent(e.target.checked)}
            />
            Поточна версія
          </label>
          <button disabled={!taskVersionFormValid} onClick={onCreateTaskVersion}>
            Створити версію
          </button>
        </div>
      </section>

      <section className={styles.sectionCard}>
        <h2>Додати бейдж</h2>
        <div className={styles.formGrid}>
          <input
            placeholder="Код (наприклад FINISHED_5)"
            value={badgeCode}
            onChange={(e) => setBadgeCode(e.target.value)}
          />
          <input
            placeholder="Назва"
            value={badgeTitle}
            onChange={(e) => setBadgeTitle(e.target.value)}
          />
          <textarea
            placeholder="Опис (необов'язково)"
            value={badgeDescription}
            onChange={(e) => setBadgeDescription(e.target.value)}
            rows={3}
          />
          <input
            placeholder="Icon (emoji, /achievements/name.png або https://...)"
            value={badgeIcon}
            onChange={(e) => setBadgeIcon(e.target.value)}
          />
          <div className={styles.helperTextMuted}>
            Підтримується: emoji (наприклад 🚀), локальний шлях з <code>public</code> (наприклад <code>/achievements/my-badge.png</code>) або повний URL <code>https://...</code>.
          </div>
          <button disabled={!badgeFormValid} onClick={onCreateBadge}>
            Створити бейдж
          </button>
        </div>
      </section>

      <section className={styles.sectionSpacing}>
        <h2>Бейджі</h2>
        <ul className={styles.listGrid}>
          {badges.map((badge) => (
            <li key={badge.id} className={styles.listItem}>
              <div className={styles.editGrid}>
                <input
                  value={badge.title}
                  onChange={(e) =>
                    setBadges((prev) =>
                      prev.map((item) =>
                        item.id === badge.id ? { ...item, title: e.target.value } : item
                      )
                    )
                  }
                />
                <input
                  value={badge.code}
                  onChange={(e) =>
                    setBadges((prev) =>
                      prev.map((item) =>
                        item.id === badge.id ? { ...item, code: e.target.value } : item
                      )
                    )
                  }
                />
                <textarea
                  value={badge.description ?? ""}
                  onChange={(e) =>
                    setBadges((prev) =>
                      prev.map((item) =>
                        item.id === badge.id ? { ...item, description: e.target.value } : item
                      )
                    )
                  }
                  rows={2}
                />
                <input
                  placeholder="Icon"
                  value={badge.icon ?? ""}
                  onChange={(e) =>
                    setBadges((prev) =>
                      prev.map((item) =>
                        item.id === badge.id ? { ...item, icon: e.target.value } : item
                      )
                    )
                  }
                />
                <div className={styles.actionsRow}>
                  <button onClick={() => onUpdateBadge(badge)}>Зберегти</button>
                  <button onClick={() => onDeleteBadge(badge.id)}>Видалити</button>
                </div>
              </div>
            </li>
          ))}
          {badges.length === 0 && <li className={styles.emptyState}>Немає бейджів</li>}
        </ul>
      </section>

      <section className={styles.sectionSpacing}>
        <h2>Вікові групи</h2>
        <ul className={styles.listGrid}>
          {ageGroups.map((group) => (
            <li key={group.id} className={styles.listItem}>
              <div className={styles.editGrid}>
                <input
                  value={group.title}
                  onChange={(e) =>
                    setAgeGroups((prev) =>
                      prev.map((item) =>
                        item.id === group.id ? { ...item, title: e.target.value } : item
                      )
                    )
                  }
                />
                <input
                  value={group.code}
                  onChange={(e) =>
                    setAgeGroups((prev) =>
                      prev.map((item) =>
                        item.id === group.id ? { ...item, code: e.target.value } : item
                      )
                    )
                  }
                />
                <label className={styles.inlineLabel}>
                  Мін. вік
                  <input
                    type="number"
                    min={0}
                    value={group.minAge}
                    onChange={(e) =>
                      setAgeGroups((prev) =>
                        prev.map((item) =>
                          item.id === group.id
                            ? { ...item, minAge: Number(e.target.value) }
                            : item
                        )
                      )
                    }
                    className={styles.smallInput}
                  />
                </label>
                <label className={styles.inlineLabel}>
                  Макс. вік
                  <input
                    type="number"
                    min={0}
                    value={group.maxAge}
                    onChange={(e) =>
                      setAgeGroups((prev) =>
                        prev.map((item) =>
                          item.id === group.id
                            ? { ...item, maxAge: Number(e.target.value) }
                            : item
                        )
                      )
                    }
                    className={styles.smallInput}
                  />
                </label>
                <label className={styles.inlineLabel}>
                  Порядок
                  <input
                    type="number"
                    min={1}
                    value={group.sortOrder}
                    onChange={(e) =>
                      setAgeGroups((prev) =>
                        prev.map((item) =>
                          item.id === group.id
                            ? { ...item, sortOrder: Number(e.target.value) }
                            : item
                        )
                      )
                    }
                    className={styles.smallInput}
                  />
                </label>
                <label className={styles.inlineLabel}>
                  <input
                    type="checkbox"
                    checked={group.isActive}
                    onChange={(e) =>
                      setAgeGroups((prev) =>
                        prev.map((item) =>
                          item.id === group.id ? { ...item, isActive: e.target.checked } : item
                        )
                      )
                    }
                  />
                  Активна
                </label>
                <div className={styles.actionsRow}>
                  <button onClick={() => onUpdateAgeGroup(group)}>Зберегти</button>
                  <button onClick={() => onDeleteAgeGroup(group.id)}>Видалити</button>
                </div>
              </div>
            </li>
          ))}
          {ageGroups.length === 0 && <li className={styles.emptyState}>Немає груп</li>}
        </ul>
      </section>

      <section className={styles.sectionSpacing}>
        <h2>Модулі</h2>
        <ul className={styles.listGrid}>
          {modules.map((m) => (
            <li key={m.id} className={styles.listItem}>
              <div style={{ fontWeight: 600 }}>{m.title}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{m.code}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.sectionSpacing}>
        <h2>Ігри</h2>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
          {games.map((g) => (
            <li key={g.id} className={styles.listItem}>
              <input
                value={g.title}
                onChange={(e) =>
                  setGames((prev) =>
                    prev.map((item) => (item.id === g.id ? { ...item, title: e.target.value } : item))
                  )
                }
              />
              <textarea
                value={g.description ?? ""}
                onChange={(e) =>
                  setGames((prev) =>
                    prev.map((item) =>
                      item.id === g.id ? { ...item, description: e.target.value } : item
                    )
                  )
                }
                rows={2}
              />
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                module: {g.moduleCode} | age: {g.minAgeGroupCode}
              </div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                Рівні: D1={levelsByGameDifficulty[`${g.id}:1`] ?? 0}, D2={levelsByGameDifficulty[`${g.id}:2`] ?? 0}, D3={levelsByGameDifficulty[`${g.id}:3`] ?? 0}
              </div>
              <label className={styles.inlineLabel}>
                Складність
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={g.difficulty}
                  onChange={(e) =>
                    setGames((prev) =>
                      prev.map((item) =>
                        item.id === g.id ? { ...item, difficulty: Number(e.target.value) } : item
                      )
                    )
                  }
                  className={styles.smallInput}
                />
              </label>
              <label className={styles.inlineLabel}>
                <input
                  type="checkbox"
                  checked={g.isActive}
                  onChange={(e) =>
                    setGames((prev) =>
                      prev.map((item) =>
                        item.id === g.id ? { ...item, isActive: e.target.checked } : item
                      )
                    )
                  }
                />
                Активна
              </label>
              <div className={styles.actionsRow}>
                <button onClick={() => onUpdateGame(g)}>Зберегти</button>
                <button onClick={() => onDeleteGame(g.id)}>Видалити</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Завдання</h2>
        {games.length === 0 ? (
          <p>Ще немає ігор.</p>
        ) : (
          games.map((g) => (
            <div key={g.id} style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600 }}>{g.title}</div>
              <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 6 }}>
                {(groupedTasks[g.id] ?? []).map((t) => (
                  <li key={t.id} style={{ border: "1px solid #eee", borderRadius: 6, padding: 8 }}>
                    <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
                      Рівень: {t.levelNumber ? `D${t.difficulty} • ${t.levelNumber}` : "без рівня"}
                    </div>
                    <div className={styles.inlineLabel}>
                      <select
                        value={t.levelId ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setTasks((prev) =>
                            prev.map((item) =>
                              item.id === t.id ? { ...item, levelId: value ? Number(value) : null } : item
                            )
                          );
                        }}
                      >
                        <option value="">Без рівня</option>
                        {(gameLevels
                          .filter((level) => level.gameId === g.id && level.isActive && !level.deletedAt)
                          .map((level) => (
                            <option key={level.id} value={level.id}>
                              D{level.difficulty} • Рівень {level.levelNumber}
                            </option>
                          ))) || null}
                      </select>
                      <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        Позиція
                        <input
                          type="number"
                          min={1}
                          value={t.position}
                          onChange={(e) =>
                            setTasks((prev) =>
                              prev.map((item) =>
                                item.id === t.id ? { ...item, position: Number(e.target.value) } : item
                              )
                            )
                          }
                          className={styles.smallInput}
                        />
                      </label>
                      <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input
                          type="checkbox"
                          checked={t.isActive}
                          onChange={(e) =>
                            setTasks((prev) =>
                              prev.map((item) =>
                                item.id === t.id ? { ...item, isActive: e.target.checked } : item
                              )
                            )
                          }
                        />
                        Активне
                      </label>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button onClick={() => onUpdateTask(t)}>Зберегти</button>
                      <button onClick={() => onDeleteTask(t.id)}>Видалити</button>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 12, opacity: 0.8 }}>Версії:</div>
                      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 6 }}>
                        {(groupedTaskVersions[t.id] ?? []).map((v) => (
                          <li key={v.id} style={{ border: "1px solid #ddd", borderRadius: 6, padding: 8 }}>
                            <input
                              value={v.prompt}
                              onChange={(e) =>
                                setTaskVersions((prev) =>
                                  prev.map((item) =>
                                    item.id === v.id ? { ...item, prompt: e.target.value } : item
                                  )
                                )
                              }
                            />
                            <textarea
                              value={JSON.stringify(v.dataJson ?? {}, null, 2)}
                              onChange={(e) =>
                                setTaskVersions((prev) =>
                                  prev.map((item) => {
                                    if (item.id !== v.id) return item;
                                    try {
                                      return { ...item, dataJson: JSON.parse(e.target.value) };
                                    } catch {
                                      return item;
                                    }
                                  })
                                )
                              }
                              rows={3}
                            />
                            <textarea
                              value={JSON.stringify(v.correctJson ?? {}, null, 2)}
                              onChange={(e) =>
                                setTaskVersions((prev) =>
                                  prev.map((item) => {
                                    if (item.id !== v.id) return item;
                                    try {
                                      return { ...item, correctJson: JSON.parse(e.target.value) };
                                    } catch {
                                      return item;
                                    }
                                  })
                                )
                              }
                              rows={2}
                            />
                            <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <input
                                type="checkbox"
                                checked={v.isCurrent}
                                onChange={(e) =>
                                  setTaskVersions((prev) =>
                                    prev.map((item) =>
                                      item.id === v.id ? { ...item, isCurrent: e.target.checked } : item
                                    )
                                  )
                                }
                              />
                              Поточна версія
                            </label>
                            <div className={styles.actionsRow}>
                              <button onClick={() => onUpdateTaskVersion(v)}>Зберегти</button>
                              <button onClick={() => onDeleteTaskVersion(v.id)}>Видалити</button>
                            </div>
                          </li>
                        ))}
                        {(!groupedTaskVersions[t.id] || groupedTaskVersions[t.id].length === 0) && (
                          <li className={styles.emptyState}>Немає версій</li>
                        )}
                      </ul>
                    </div>
                  </li>
                ))}
                {(!groupedTasks[g.id] || groupedTasks[g.id].length === 0) && (
                  <li className={styles.emptyState}>Немає завдань</li>
                )}
              </ul>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
