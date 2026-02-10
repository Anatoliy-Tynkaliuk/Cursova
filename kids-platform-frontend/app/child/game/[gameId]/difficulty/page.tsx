"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getChildSession } from "@/lib/auth";
import { getGames, type GameListItem } from "@/lib/endpoints";

const difficultyLabels: Record<number, string> = {
  1: "Легко",
  2: "Середньо",
  3: "Складно",
};

export default function GameDifficultyPage() {
  const params = useParams<{ gameId: string }>();
  const gameId = Number(params.gameId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [game, setGame] = useState<GameListItem | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(1);

  useEffect(() => {
    const session = getChildSession();
    if (!session.childProfileId || !session.ageGroupCode) {
      window.location.href = "/child/join";
      return;
    }

    async function loadGame() {
      setError(null);
      try {
        const games = await getGames(session.ageGroupCode!);
        const currentGame = games.find((item) => item.id === gameId) ?? null;

        if (!currentGame) {
          setError("Гру не знайдено для поточної вікової групи.");
          return;
        }

        setGame(currentGame);
        const defaultDifficulty =
          currentGame.availableDifficulties?.[0] ?? currentGame.difficultyLevels?.[0] ?? currentGame.difficulty;
        setSelectedDifficulty(defaultDifficulty);
      } catch (e: any) {
        setError(e.message ?? "Сталася помилка");
      } finally {
        setLoading(false);
      }
    }

    loadGame().catch((e: any) => {
      setError(e.message ?? "Сталася помилка");
      setLoading(false);
    });
  }, [gameId]);

  const levelSelectLink = useMemo(
    () => `/child/game/${gameId}/levels?difficulty=${selectedDifficulty}`,
    [gameId, selectedDifficulty],
  );

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>
      <section style={{ width: "100%", maxWidth: 460, border: "1px solid #ddd", borderRadius: 16, padding: 20 }}>
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>Вибір складності</h1>

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

            <label style={{ display: "grid", gap: 6, marginBottom: 16 }}>
              <span>Оберіть рівень складності:</span>
              <select
                value={selectedDifficulty}
                onChange={(event) => setSelectedDifficulty(Number(event.target.value))}
              >
                {(game?.difficultyLevels ?? [1, 2, 3]).map((difficulty) => {
                  const count = (game?.difficultyTaskCounts ?? []).find((item) => item.difficulty === difficulty)?.count ?? 0;
                  return (
                    <option key={difficulty} value={difficulty}>
                      {(difficultyLabels[difficulty] ?? `Рівень ${difficulty}`) + ` (${count} рівнів)`}
                    </option>
                  );
                })}
              </select>
            </label>

            <div style={{ display: "flex", gap: 10 }}>
              <Link href={levelSelectLink} style={{ padding: "10px 14px", border: "1px solid #333", borderRadius: 8 }}>
                Обрати рівень
              </Link>
              <Link href="/child/subjects" style={{ padding: "10px 14px" }}>
                Назад
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
