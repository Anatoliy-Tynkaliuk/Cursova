"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getChildSession } from "@/lib/auth";
import { getGameLevels, type GameLevelsResponse } from "@/lib/endpoints";

const difficultyLabels: Record<number, string> = {
  1: "Легко",
  2: "Середньо",
  3: "Складно",
};

function normalizeDifficulty(value: string | null): number | null {
  if (!value) return null;
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : null;
}

export default function GameLevelsPage() {
  const params = useParams<{ gameId: string }>();
  const search = useSearchParams();
  const gameId = Number(params.gameId);
  const difficulty = normalizeDifficulty(search.get("difficulty"));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [levelsData, setLevelsData] = useState<GameLevelsResponse | null>(null);

  useEffect(() => {
    if (!difficulty) {
      window.location.href = `/child/game/${gameId}/difficulty`;
      return;
    }

    const session = getChildSession();
    if (!session.childProfileId || !session.ageGroupCode) {
      window.location.href = "/child/join";
      return;
    }

    async function loadData() {
      setError(null);
      try {
        const data = await getGameLevels(gameId, difficulty, session.childProfileId!);
        setLevelsData(data);
      } catch (e: any) {
        setError(e.message ?? "Сталася помилка");
      } finally {
        setLoading(false);
      }
    }

    loadData().catch((e: any) => {
      setError(e.message ?? "Сталася помилка");
      setLoading(false);
    });
  }, [difficulty, gameId]);

  const levelLinks = useMemo(() => {
    if (!difficulty || !levelsData) return [];

    return levelsData.levels.map((item) => ({
      ...item,
      href: `/child/game/${gameId}?difficulty=${difficulty}&level=${item.level}&levelId=${item.levelId}`,
    }));
  }, [difficulty, gameId, levelsData]);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>
      <section style={{ width: "100%", maxWidth: 560, border: "1px solid #ddd", borderRadius: 16, padding: 20 }}>
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>Рівні гри</h1>

        {loading ? (
          <p>Завантаження...</p>
        ) : error ? (
          <>
            <p>{error}</p>
            <Link href="/child/subjects">Повернутися до планет</Link>
          </>
        ) : (
          <>
            <p style={{ marginTop: 0 }}>
              Гра: <b>{levelsData?.gameTitle ?? `#${gameId}`}</b>
            </p>
            <p>
              Складність: <b>{difficulty ? (difficultyLabels[difficulty] ?? `Рівень ${difficulty}`) : "—"}</b>
            </p>

            {levelLinks.length > 0 ? (
              <>
                <p>Оберіть рівень цієї складності:</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 10 }}>
                  {levelLinks.map((item) => {
                    const bg = item.state === "completed" ? "#d1fae5" : item.state === "locked" ? "#f3f4f6" : "#fff";
                    const color = item.state === "locked" ? "#9ca3af" : "#111";
                    const label = item.state === "completed" ? "✓" : item.state === "locked" ? "🔒" : "▶";

                    if (item.isLocked) {
                      return (
                        <div
                          key={item.level}
                          style={{
                            border: "1px solid #d1d5db",
                            borderRadius: 10,
                            padding: "10px 8px",
                            textAlign: "center",
                            background: bg,
                            color,
                          }}
                        >
                          {label} Рівень {item.level}
                          <div style={{ fontSize: 11 }}>{item.title}</div>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={item.level}
                        href={item.href}
                        style={{
                          border: "1px solid #333",
                          borderRadius: 10,
                          padding: "10px 8px",
                          textAlign: "center",
                          background: bg,
                          color,
                        }}
                      >
                        {label} Рівень {item.level}
                          <div style={{ fontSize: 11 }}>{item.title}</div>
                      </Link>
                    );
                  })}
                </div>
              </>
            ) : (
              <p>Для цієї складності поки немає рівнів. Обери іншу складність.</p>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <Link href={`/child/game/${gameId}/difficulty`} style={{ padding: "10px 14px", border: "1px solid #333", borderRadius: 8 }}>
                Інша складність
              </Link>
              <Link href="/child/subjects" style={{ padding: "10px 14px" }}>
                До планет
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
