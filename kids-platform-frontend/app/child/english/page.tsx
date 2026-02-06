"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getChildBadgesPublic, getGames, type ChildBadgeItem, type GameListItem } from "@/lib/endpoints";
import { getChildSession } from "@/lib/auth";

export default function EnglishPlanetPage() {
  const [games, setGames] = useState<GameListItem[]>([]);
  const [badges, setBadges] = useState<ChildBadgeItem[]>([]);
  const [finishedAttempts, setFinishedAttempts] = useState(0);
  const [childName, setChildName] = useState("Друже");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getChildSession();
    if (!session.childProfileId || !session.ageGroupCode) {
      window.location.href = "/child/join";
      return;
    }
    setChildName(session.childName || "Друже");

    async function load() {
      setError(null);
      try {
        const [gamesData, badgeData] = await Promise.all([
          getGames(session.ageGroupCode!),
          getChildBadgesPublic(session.childProfileId!),
        ]);
        setGames(gamesData);
        setBadges(badgeData.badges);
        setFinishedAttempts(badgeData.finishedAttempts);
      } catch (e: any) {
        setError(e.message ?? "Error");
      }
    }

    load().catch((e: any) => setError(e.message ?? "Error"));
  }, []);

  const englishGames = useMemo(() => games.filter((game) => game.moduleCode === "english"), [games]);
  const earnedBadges = useMemo(() => badges.filter((badge) => badge.isEarned).length, [badges]);

  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Планета Англійська</h1>
        <Link href="/child/subjects">← Назад до меню</Link>
      </header>

      <p>Привіт, {childName}! Тут зібрані ігри з англійської мови для твоєї вікової групи.</p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div>Завершено ігор: {finishedAttempts}</div>
        <div>Досягнень: {earnedBadges}</div>
        <div>Доступних ігор: {englishGames.length}</div>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {englishGames.length === 0 ? (
        <p>Поки немає ігор з англійської для цієї вікової групи.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
          {englishGames.map((game) => (
            <li key={game.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
              <div style={{ fontWeight: 600 }}>{game.title}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                type: {game.gameTypeCode} | diff: {game.difficulty}
              </div>
              <button style={{ marginTop: 8 }} onClick={() => (window.location.href = `/child/game/${game.id}`)}>
                Почати гру
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
