"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getChildBadgesPublic, getGames, type GameListItem } from "@/lib/endpoints";
import { getChildSession } from "@/lib/auth";

export default function ChildProfilePage() {
  const [games, setGames] = useState<GameListItem[]>([]);
  const [finishedAttempts, setFinishedAttempts] = useState(0);
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
        const [gamesData, badgeData] = await Promise.all([
          getGames(session.ageGroupCode!),
          getChildBadgesPublic(session.childProfileId!),
        ]);
        setGames(gamesData);
        setFinishedAttempts(badgeData.finishedAttempts);
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

  return (
    <div style={{ padding: 16, maxWidth: 800 }}>
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
        <div>Завершено ігор: {finishedAttempts}</div>
        <div>Усього доступних ігор: {games.length}</div>
        <div>Логіка: {gamesByModule.logic ?? 0}</div>
        <div>Математика: {gamesByModule.math ?? 0}</div>
        <div>Англійська: {gamesByModule.english ?? 0}</div>
      </section>
    </div>
  );
}
