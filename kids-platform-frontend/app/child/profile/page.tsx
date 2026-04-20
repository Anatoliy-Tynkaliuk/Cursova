"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getChildBadgesPublic, getChildStatsPublic, getGames, type ChildStats, type GameListItem } from "@/lib/endpoints";
import { getChildSession } from "@/lib/auth";

export default function ChildProfilePage() {
  const [games, setGames] = useState<GameListItem[]>([]);
  const [finishedAttempts, setFinishedAttempts] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [stats, setStats] = useState<ChildStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [childName, setChildName] = useState("Друже");
  const [ageGroupCode, setAgeGroupCode] = useState<string | null>(null);

  useEffect(() => {
    const session = getChildSession();
    if (!session.childProfileId || !session.ageGroupCode) {
      window.location.href = "/child/join";
      return;
    }
    setChildName(session.childName || "Друже");
    setAgeGroupCode(session.ageGroupCode);

    async function load() {
      setError(null);
      try {
        const [gamesData, badgeData, statsData] = await Promise.all([
          getGames(session.ageGroupCode!),
          getChildBadgesPublic(session.childProfileId!),
          getChildStatsPublic(session.childProfileId!),
        ]);
        setGames(gamesData);
        setFinishedAttempts(badgeData.finishedAttempts);
        setTotalStars(badgeData.totalStars ?? badgeData.finishedAttempts);
        setStats(statsData);
      } catch (e: any) {
        setError(e.message ?? "Error");
      }
    }

    load().catch((e: any) => setError(e.message ?? "Error"));
  }, []);

  const gamesByModule = useMemo(() => {
    return games.reduce<Record<string, number>>((acc, game) => {
      acc[game.moduleCode] = (acc[game.moduleCode] ?? 0) + 1;
      return acc;
    }, {});
  }, [games]);

  const completionPercent = useMemo(() => {
    if (!stats?.summary.totalAttempts) return 0;
    return Math.round((stats.summary.finishedAttempts / stats.summary.totalAttempts) * 100);
  }, [stats]);

  const accuracyPercent = useMemo(() => {
    if (!stats?.summary.totalQuestions) return 0;
    return Math.round((stats.summary.totalCorrect / stats.summary.totalQuestions) * 100);
  }, [stats]);

  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Профіль дитини</h1>
        <Link href="/child/subjects">← Назад до меню</Link>
      </header>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 20 }}>{childName}</div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>Вікова група: {ageGroupCode ?? "—"}</div>
      </div>

      <section style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
        <h2 style={{ marginTop: 0 }}>Прогрес</h2>
        <div>Завершено ігор: {finishedAttempts} | Зірочок: {totalStars}</div>
        <div>Усього доступних ігор: {games.length}</div>
        <div>Логіка: {gamesByModule.logic ?? 0}</div>
        <div>Математика: {gamesByModule.math ?? 0}</div>
        <div>Англійська: {gamesByModule.english ?? 0}</div>
        <div style={{ marginTop: 8 }}>Відсоток завершення спроб: {completionPercent}%</div>
        <div>Точність відповідей: {accuracyPercent}%</div>
      </section>

      <section style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
        <h2 style={{ marginTop: 0 }}>Активність (останні ігри)</h2>
        {!stats || stats.attempts.length === 0 ? (
          <p>Поки що немає ігрової активності.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
            {stats.attempts.slice(0, 10).map((attempt) => (
              <li key={attempt.id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 10 }}>
                <div style={{ fontWeight: 700 }}>{attempt.game.title}</div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>Модуль: {attempt.game.moduleCode}</div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>
                  Результат: {attempt.correctCount}/{attempt.totalCount} | Бали: {attempt.score}
                </div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>{attempt.isFinished ? "Завершено" : "У процесі"}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
