"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  const router = useRouter();
  const gameId = Number(params.gameId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [game, setGame] = useState<GameListItem | null>(null);

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

  const handleDifficultySelect = (difficulty: number) => {
    router.push(`/child/game/${gameId}/levels?difficulty=${difficulty}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.bg} />
      <div className={styles.overlay} />

      <main className={styles.container}>
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

              <div className={styles.list}>
                {difficulties.map((difficulty) => {
                  const label = difficultyLabels[difficulty] ?? `Рівень ${difficulty}`;
                  const count = difficultyCounts.get(difficulty) ?? 0;

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
                      className={[styles.card, colorClass].join(" ")}
                      onClick={() => handleDifficultySelect(difficulty)}
                    >
                      <div className={styles.cardInner}>
                        <div className={styles.bigText}>{label}</div>
                        <div className={styles.smallText}>Кількість рівнів: {count}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className={styles.actions}>
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
