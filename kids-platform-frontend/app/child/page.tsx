"use client";

import { useEffect, useState } from "react";
import { getGames, startAttempt, GameListItem } from "@/lib/endpoints";
import Link from "next/link";
import { getChildSession, clearChildSession } from "@/lib/auth";

export default function ChildHomePage() {
  const [ageGroupCode, setAgeGroupCode] = useState<string | null>(null);
  const [childProfileId, setChildProfileId] = useState<number | null>(null);
  const [games, setGames] = useState<GameListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = getChildSession();
    if (!session.childProfileId || !session.ageGroupCode) {
      window.location.href = "/child/join";
      return;
    }
    setChildProfileId(session.childProfileId);
    setAgeGroupCode(session.ageGroupCode);
  }, []);

  async function load(code: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await getGames(code);
      setGames(data);
    } catch (e: any) {
      setError(e.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (ageGroupCode) {
      load(ageGroupCode);
    }
  }, [ageGroupCode]);

  async function onStart(gameId: number) {
    if (!childProfileId) return;
    setError(null);
    try {
      const res = await startAttempt(childProfileId, gameId);
      // переходимо на сторінку гри
      window.location.href = `/child/game/${res.game.id}?attemptId=${res.attemptId}`;
    } catch (e: any) {
      setError(e.message ?? "Error");
    }
  }

    function onExit() {
    clearChildSession();
    window.location.href = "/child/join";
  }

return (
    <div style={{ padding: 16 }}>
      <h1>Вибір гри</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <button onClick={onExit}>Вийти</button>
        <button onClick={() => ageGroupCode && load(ageGroupCode)} disabled={loading || !ageGroupCode}>
          {loading ? "Завантажую..." : "Оновити"}
        </button>


        <Link href="/">На головну</Link>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {games.length === 0 ? (
        <p>Нема ігор для цієї вікової групи.</p>
      ) : (
        <ul style={{ display: "grid", gap: 10, listStyle: "none", padding: 0 }}>
          {games.map((g) => (
            <li key={g.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
              <div style={{ fontWeight: 600 }}>{g.title}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                module: {g.moduleCode} | type: {g.gameTypeCode} | diff: {g.difficulty}
              </div>
              <button style={{ marginTop: 8 }} onClick={() => onStart(g.id)}>
                Почати
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
