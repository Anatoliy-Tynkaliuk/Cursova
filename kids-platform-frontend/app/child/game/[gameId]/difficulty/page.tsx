"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getChildSession } from "@/lib/auth";
import { getGames, type GameListItem } from "@/lib/endpoints";
import styles from "./difficulty.module.css";

const difficultyLabels: Record<number, string> = {
  1: "Легкий",
  2: "Середній",
  3: "Важкий",
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
          currentGame.availableDifficulties?.[0] ??
          currentGame.difficultyLevels?.[0] ??
          currentGame.difficulty;

        setSelectedDifficulty(defaultDifficulty ?? 1);
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

  const difficulties = useMemo(() => {
    const list = game?.difficultyLevels?.length ? game.difficultyLevels : [1, 2, 3];
    return list.filter((d) => d === 1 || d === 2 || d === 3);
  }, [game]);

  const difficultyCounts = useMemo(() => {
    const map = new Map<number, number>();
    (game?.difficultyTaskCounts ?? []).forEach((x) => map.set(x.difficulty, x.count));
    return map;
  }, [game]);

  const levelSelectLink = useMemo(
    () => `/child/game/${gameId}/levels?difficulty=${selectedDifficulty}`,
    [gameId, selectedDifficulty]
  );

  return (
    <div className={styles.page}>
      <div className={styles.bg} />
      <div className={styles.overlay} />

      <main className={styles.container}>
        <header className={styles.topBar}>
          <Link href="/child/subjects" className={styles.backBtn}>
          Назад
          </Link>
        </header>

        <section className={styles.panel}>
          <h1 className={styles.title}>Обери складність</h1>
          <div className={styles.titleGlow} />

          {loading ? (
            <p className={styles.stateText}>Завантаження...</p>
          ) : error ? (
            <div className={styles.stateBox}>
              <p className={styles.errorText}>{error}</p>
              <Link href="/child/subjects" className={styles.linkInline}>
                Повернутися до планет
              </Link>
            </div>
          ) : (
            <>
              <p className={styles.gameLine}>
                Гра: <b>{game?.title ?? `#${gameId}`}</b>
              </p>

              <div className={styles.list} role="radiogroup" aria-label="Вибір складності">
                {difficulties.map((difficulty) => {
                  const label = difficultyLabels[difficulty] ?? `Рівень ${difficulty}`;
                  const count = difficultyCounts.get(difficulty) ?? 0;
                  const active = selectedDifficulty === difficulty;

                  const colorClass =
                    difficulty === 1
                      ? styles.diffEasy
                      : difficulty === 2
                      ? styles.diffMid
                      : styles.diffHard;

                  return (
                    <button
                      key={difficulty}
                      type="button"
                      className={[styles.card, colorClass, active ? styles.active : ""].join(" ")}
                      onClick={() => setSelectedDifficulty(difficulty)}
                      role="radio"
                      aria-checked={active}
                    >
                      <div className={styles.cardInner}>
                        <div className={styles.bigText}>{label}</div>
                        <div className={styles.smallText}>Кількість рівнів: {count}</div>
                      </div>

                      {active && <div className={styles.cornerTick}>✓</div>}
                    </button>
                  );
                })}
              </div>

              <div className={styles.actions}>
                <Link href={levelSelectLink} className={styles.primaryBtn}>
                  Обрати рівень
                </Link>
                <Link href="/child/subjects" className={styles.secondaryBtn}>
                  Назад
                </Link>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
