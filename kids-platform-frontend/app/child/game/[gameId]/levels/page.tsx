"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getChildSession } from "@/lib/auth";
import { getGames, type GameListItem } from "@/lib/endpoints";

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
  const [game, setGame] = useState<GameListItem | null>(null);
  const [levelsCount, setLevelsCount] = useState(0);

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
        const games = await getGames(session.ageGroupCode!);
        const currentGame = games.find((item) => item.id === gameId) ?? null;

        if (!currentGame) {
          setError("Гру не знайдено для поточної вікової групи.");
          return;
        }

        const count = (currentGame.difficultyTaskCounts ?? []).find((item) => item.difficulty === difficulty)?.count ?? 0;
        setGame(currentGame);
        setLevelsCount(count);
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
    if (!difficulty || levelsCount <= 0) return [];
    return Array.from({ length: levelsCount }, (_, index) => ({
      level: index + 1,
      href: `/child/game/${gameId}?difficulty=${difficulty}&level=${index + 1}`,
    }));
  }, [difficulty, gameId, levelsCount]);

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
              Гра: <b>{game?.title ?? `#${gameId}`}</b>
            </p>
            <p>
              Складність: <b>{difficulty ? (difficultyLabels[difficulty] ?? `Рівень ${difficulty}`) : "—"}</b>
            </p>

            {levelsCount > 0 ? (
              <>
                <p>Оберіть рівень цієї складності:</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 10 }}>
                  {levelLinks.map((item) => (
                    <Link
                      key={item.level}
                      href={item.href}
                      style={{
                        border: "1px solid #333",
                        borderRadius: 10,
                        padding: "10px 8px",
                        textAlign: "center",
                      }}
                    >
                      Рівень {item.level}
                    </Link>
                  ))}
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
