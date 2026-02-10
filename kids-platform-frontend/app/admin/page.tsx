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
  type AdminModuleItem,
  type AdminTaskItem,
  type AdminTaskVersionItem,
} from "@/lib/endpoints";
import { isLoggedIn } from "@/lib/auth";

export default function AdminPage() {
  const parseSelectNumber = (value: string): number | "" => (value === "" ? "" : Number(value));

  const [modules, setModules] = useState<AdminModuleItem[]>([]);
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
  const [minAgeGroupId, setMinAgeGroupId] = useState<number | "">("");
  const [difficulty, setDifficulty] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const [levelGameId, setLevelGameId] = useState<number | "">("");
  const [levelDifficulty, setLevelDifficulty] = useState(1);
  const [levelTitle, setLevelTitle] = useState("");
  const [levelNumber, setLevelNumber] = useState<number | "">("");
  const [levelIsActive, setLevelIsActive] = useState(true);
  const [quickLevelsGameId, setQuickLevelsGameId] = useState<number | "">("");
  const [quickLevelsPerDifficulty, setQuickLevelsPerDifficulty] = useState(5);

  const [taskGameId, setTaskGameId] = useState<number | "">("");
  const [taskLevelId, setTaskLevelId] = useState<number | "">("");
  const [taskPosition, setTaskPosition] = useState(1);
  const [taskIsActive, setTaskIsActive] = useState(true);

  const [taskId, setTaskId] = useState<number | "">("");
  const [taskVersion, setTaskVersion] = useState(1);
  const [taskPrompt, setTaskPrompt] = useState("");
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
    minAgeGroupId !== "";

  const levelFormValid = levelGameId !== "" && levelTitle.trim().length > 0 && [1, 2, 3].includes(levelDifficulty);
  const quickLevelsFormValid =
    quickLevelsGameId !== "" && Number.isInteger(quickLevelsPerDifficulty) && quickLevelsPerDifficulty > 0;

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
          ageGroupsData,
          gamesData,
          gameLevelsData,
          tasksData,
          taskVersionsData,
          badgesData,
        ] = await Promise.all([
          getAdminModules(),
          getAdminAgeGroups(),
          getAdminGames(),
          getAdminGameLevels(),
          getAdminTasks(),
          getAdminTaskVersions(),
          getAdminBadges(),
        ]);
        setModules(modulesData);
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

  const taskPositionTaken = useMemo(() => {
    if (taskGameId === "") return false;
    const list = groupedTasks[taskGameId] ?? [];
    return list.some((t) => t.position === taskPosition);
  }, [groupedTasks, taskGameId, taskPosition]);

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
    if (!formValid || moduleId === "" || minAgeGroupId === "") return;
    setError(null);
    setMessage(null);
    try {
      const createdGame = await createAdminGame({
        moduleId,
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
      setQuickLevelsGameId(createdGame.id);
      const gamesData = await getAdminGames();
      setGames(gamesData);
    } catch (e: any) {
      setError(e.message ?? "Error");
    }
  }

  async function onCreateLevelsForAllDifficulties() {
    if (!quickLevelsFormValid || quickLevelsGameId === "") return;

    setError(null);
    setMessage(null);

    try {
      for (const difficultyItem of [1, 2, 3]) {
        for (let i = 1; i <= quickLevelsPerDifficulty; i++) {
          await createAdminGameLevel({
            gameId: quickLevelsGameId,
            difficulty: difficultyItem,
            title: `Рівень ${i} (Складність ${difficultyItem})`,
          });
        }
      }

      setMessage(`Додано по ${quickLevelsPerDifficulty} рівнів для кожної складності (1, 2, 3).`);
      const levelsData = await getAdminGameLevels();
      setGameLevels(levelsData);
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
    if (!levelFormValid || levelGameId === "") return;

    setError(null);
    setMessage(null);
    try {
      await createAdminGameLevel({
        gameId: levelGameId,
        difficulty: levelDifficulty,
        title: levelTitle.trim(),
        levelNumber: levelNumber === "" ? undefined : levelNumber,
        isActive: levelIsActive,
      });

      setMessage("Рівень створено.");
      setLevelTitle("");
      setLevelNumber("");
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
    } catch (e: any) {
      setError(e.message ?? "Error");
    }
  }

  async function onCreateTask() {
    if (!taskFormValid || taskGameId === "") return;
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
    if (!taskVersionFormValid || taskId === "") return;
    setError(null);
    setMessage(null);
    try {
      const dataJson = taskDataJson.trim() ? JSON.parse(taskDataJson) : {};
      const correctJson = taskCorrectJson.trim() ? JSON.parse(taskCorrectJson) : {};
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
      setTaskDataJson("{\"options\":[]}");
      setTaskCorrectJson("{\"answer\":\"\"}");
      setTaskExplanation("");
      setTaskDifficulty(1);
      const taskVersionsData = await getAdminTaskVersions();
      setTaskVersions(taskVersionsData);
    } catch (e: any) {
      setError(e.message ?? "Невірний JSON для dataJson або correctJson");
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
    <div style={{ padding: 16, maxWidth: 1000 }}>
      <h1>Адмінка контенту</h1>
      {loading && <p>Завантаження...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      <section style={{ border: "1px solid #333", borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <h2>Додати вікову групу</h2>
        <div style={{ display: "grid", gap: 12, maxWidth: 480 }}>
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
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            Мін. вік
            <input
              type="number"
              min={0}
              value={ageGroupMinAge}
              onChange={(e) => setAgeGroupMinAge(Number(e.target.value))}
              style={{ width: 80 }}
            />
          </label>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            Макс. вік
            <input
              type="number"
              min={0}
              value={ageGroupMaxAge}
              onChange={(e) => setAgeGroupMaxAge(Number(e.target.value))}
              style={{ width: 80 }}
            />
          </label>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            Порядок
            <input
              type="number"
              min={1}
              value={ageGroupSortOrder}
              onChange={(e) => setAgeGroupSortOrder(Number(e.target.value))}
              style={{ width: 80 }}
            />
          </label>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
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

      <section style={{ border: "1px solid #333", borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <h2>Додати гру</h2>
        <div style={{ display: "grid", gap: 12, maxWidth: 480 }}>
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
          <select value={minAgeGroupId} onChange={(e) => setMinAgeGroupId(parseSelectNumber(e.target.value))}>
            <option value="">Вікова група</option>
            {ageGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            Складність
            <input
              type="number"
              min={1}
              max={5}
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              style={{ width: 80 }}
            />
          </label>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
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

      <section style={{ border: "1px solid #333", borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <h2>Швидко додати рівні для всіх складностей гри</h2>
        <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
          <select
            value={quickLevelsGameId}
            onChange={(e) => setQuickLevelsGameId(Number(e.target.value))}
          >
            <option value="">Гра</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            Рівнів на кожну складність
            <input
              type="number"
              min={1}
              value={quickLevelsPerDifficulty}
              onChange={(e) => setQuickLevelsPerDifficulty(Number(e.target.value))}
              style={{ width: 90 }}
            />
          </label>

          <button disabled={!quickLevelsFormValid} onClick={onCreateLevelsForAllDifficulties}>
            Додати рівні 1-3
          </button>

          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Автоматично створює рівні для складностей 1, 2, 3 з назвами формату
            <code style={{ marginLeft: 6 }}>Рівень N (Складність D)</code>
          </div>
        </div>
      </section>

      <section style={{ border: "1px solid #333", borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <h2>Додати рівень гри</h2>
        <div style={{ display: "grid", gap: 12, maxWidth: 480 }}>
          <select value={levelGameId} onChange={(e) => setLevelGameId(Number(e.target.value))}>
            <option value="">Гра</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            Номер рівня (необов'язково)
            <input
              type="number"
              min={1}
              value={levelNumber}
              onChange={(e) => {
                const value = e.target.value;
                setLevelNumber(value ? Number(value) : "");
              }}
              style={{ width: 100 }}
            />
          </label>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
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

      <section style={{ marginBottom: 20 }}>
        <h2>Рівні ігор</h2>
        {gameLevels.length === 0 ? (
          <p>Немає рівнів.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
            {gameLevels.map((level) => (
              <li key={level.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>
                  {level.gameTitle} • D{level.difficulty}
                </div>
                <div style={{ display: "grid", gap: 8 }}>
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
                  <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
                      style={{ width: 90 }}
                    />
                  </label>
                  <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => onUpdateGameLevel(level)}>Зберегти</button>
                    <button onClick={() => onDeleteGameLevel(level.id)}>Видалити</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ border: "1px solid #333", borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <h2>Додати завдання</h2>
        <div style={{ display: "grid", gap: 12, maxWidth: 480 }}>
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
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            Позиція
            <input
              type="number"
              min={1}
              value={taskPosition}
              onChange={(e) => setTaskPosition(Number(e.target.value))}
              style={{ width: 80 }}
            />
          </label>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
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

      <section style={{ border: "1px solid #333", borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <h2>Додати версію завдання</h2>
        <div style={{ display: "grid", gap: 12, maxWidth: 480 }}>
          <select value={taskId} onChange={(e) => setTaskId(Number(e.target.value))}>
            <option value="">Завдання</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.gameTitle} — #{t.position}
              </option>
            ))}
          </select>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            Версія
            <input
              type="number"
              min={1}
              value={taskVersion}
              onChange={(e) => setTaskVersion(Number(e.target.value))}
              style={{ width: 80 }}
            />
          </label>
          <input
            placeholder="Prompt"
            value={taskPrompt}
            onChange={(e) => setTaskPrompt(e.target.value)}
          />
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
          <input
            placeholder="Пояснення (необов'язково)"
            value={taskExplanation}
            onChange={(e) => setTaskExplanation(e.target.value)}
          />
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            Складність
            <input
              type="number"
              min={1}
              max={5}
              value={taskDifficulty}
              onChange={(e) => setTaskDifficulty(Number(e.target.value))}
              style={{ width: 80 }}
            />
          </label>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
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

      <section style={{ border: "1px solid #333", borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <h2>Додати бейдж</h2>
        <div style={{ display: "grid", gap: 12, maxWidth: 480 }}>
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
            placeholder="Icon (emoji або URL)"
            value={badgeIcon}
            onChange={(e) => setBadgeIcon(e.target.value)}
          />
          <button disabled={!badgeFormValid} onClick={onCreateBadge}>
            Створити бейдж
          </button>
        </div>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2>Бейджі</h2>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
          {badges.map((badge) => (
            <li key={badge.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 10 }}>
              <div style={{ display: "grid", gap: 8 }}>
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
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => onUpdateBadge(badge)}>Зберегти</button>
                  <button onClick={() => onDeleteBadge(badge.id)}>Видалити</button>
                </div>
              </div>
            </li>
          ))}
          {badges.length === 0 && <li style={{ fontSize: 12, opacity: 0.7 }}>Немає бейджів</li>}
        </ul>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2>Вікові групи</h2>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
          {ageGroups.map((group) => (
            <li key={group.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 10 }}>
              <div style={{ display: "grid", gap: 8 }}>
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
                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
                    style={{ width: 80 }}
                  />
                </label>
                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
                    style={{ width: 80 }}
                  />
                </label>
                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
                    style={{ width: 80 }}
                  />
                </label>
                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => onUpdateAgeGroup(group)}>Зберегти</button>
                  <button onClick={() => onDeleteAgeGroup(group.id)}>Видалити</button>
                </div>
              </div>
            </li>
          ))}
          {ageGroups.length === 0 && <li style={{ fontSize: 12, opacity: 0.7 }}>Немає груп</li>}
        </ul>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2>Модулі</h2>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
          {modules.map((m) => (
            <li key={m.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 10 }}>
              <div style={{ fontWeight: 600 }}>{m.title}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{m.code}</div>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2>Ігри</h2>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
          {games.map((g) => (
            <li key={g.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 10 }}>
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
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
                  style={{ width: 80 }}
                />
              </label>
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
              <div style={{ display: "flex", gap: 8 }}>
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
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
                          style={{ width: 80 }}
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
                            <div style={{ display: "flex", gap: 8 }}>
                              <button onClick={() => onUpdateTaskVersion(v)}>Зберегти</button>
                              <button onClick={() => onDeleteTaskVersion(v.id)}>Видалити</button>
                            </div>
                          </li>
                        ))}
                        {(!groupedTaskVersions[t.id] || groupedTaskVersions[t.id].length === 0) && (
                          <li style={{ fontSize: 12, opacity: 0.7 }}>Немає версій</li>
                        )}
                      </ul>
                    </div>
                  </li>
                ))}
                {(!groupedTasks[g.id] || groupedTasks[g.id].length === 0) && (
                  <li style={{ fontSize: 12, opacity: 0.7 }}>Немає завдань</li>
                )}
              </ul>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
