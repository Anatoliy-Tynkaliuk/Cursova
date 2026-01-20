"use client";

import { useEffect, useState } from "react";
import { getGames, startAttempt, GameListItem } from "@/lib/endpoints";
import Link from "next/link";

export default function ChildHomePage() {
  const [ageGroupCode, setAgeGroupCode] = useState("3_5");
  const [childProfileId, setChildProfileId] = useState(1); // <-- постав свій існуючий childProfileId
  const [games, setGames] = useState<GameListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  const saved = localStorage.getItem("childProfileId");
  if (saved) setChildProfileId(Number(saved));
}, []);

useEffect(() => {
  localStorage.setItem("childProfileId", String(childProfileId));
}, [childProfileId]);


  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getGames(ageGroupCode);
      setGames(data);
    } catch (e: any) {
      setError(e.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ageGroupCode]);

  async function onStart(gameId: number) {
    setError(null);
    try {
      const res = await startAttempt(childProfileId, gameId);
      // переходимо на сторінку гри
      window.location.href = `/child/game/${res.game.id}?attemptId=${res.attemptId}`;
    } catch (e: any) {
      setError(e.message ?? "Error");
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Вибір гри</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <label>
          Age group code:
          <input value={ageGroupCode} onChange={(e) => setAgeGroupCode(e.target.value)} style={{ marginLeft: 8 }} />
        </label>

        <label>
          ChildProfileId:
          <input
            type="number"
            value={childProfileId}
            onChange={(e) => setChildProfileId(Number(e.target.value))}
            style={{ marginLeft: 8, width: 90 }}
          />
        </label>

        <button onClick={load} disabled={loading}>
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
