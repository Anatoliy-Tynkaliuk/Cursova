"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./english.module.css";
import { getChildBadgesPublic, getGameLevels, getGames, type GameListItem } from "@/lib/endpoints";
import { getChildSession } from "@/lib/auth";

const gameTypeImageMap: Record<string, string> = {
  test: "/background_games_images/background_games_test.png",
  drag: "/background_games_images/background_games_drag.png",
  sequence: "/background_games_images/background_games_sequence.png",
};

function getGameCardImage(game: GameListItem, fallbackIndex: number) {
  const key = (game.gameTypeCode || "").toLowerCase();
  if (gameTypeImageMap[key]) return gameTypeImageMap[key];

  const fallback = [
    "/Planeta_logika/background_games_match.png",
    "/Planeta_logika/background_games_test.png",
    "/Planeta_logika/background_games_dragging.png",
  ];
  return fallback[fallbackIndex % fallback.length];
}

type ChildStats = {
  level: number;
  stars: number;
  achievements: number;
};

type GameProgress = {
  totalLevels: number;
  completedLevels: number;
};

export default function EnglishPlanetPage() {
  const [childName, setChildName] = useState("Друже");
  const [stats, setStats] = useState<ChildStats>({ level: 1, stars: 0, achievements: 0 });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<GameListItem[]>([]);
  const [gameProgressById, setGameProgressById] = useState<Record<number, GameProgress>>({});

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
        const englishGames = gamesData.filter((game) => game.moduleCode === "english");
        setGames(englishGames);

        const progressEntries = await Promise.all(
          englishGames.map(async (game) => {
            const difficulties = game.availableDifficulties.length
              ? game.availableDifficulties
              : game.difficultyLevels;

            const levelsByDifficulty = await Promise.all(
              difficulties.map((difficulty) =>
                getGameLevels(game.id, difficulty, session.childProfileId!).catch(() => null)
              )
            );

            const totals = levelsByDifficulty.reduce(
              (acc, levelsData) => {
                if (!levelsData) return acc;
                acc.totalLevels += levelsData.levels.length;
                acc.completedLevels += levelsData.levels.filter((level) => level.isCompleted).length;
                return acc;
              },
              { totalLevels: 0, completedLevels: 0 }
            );

            return [game.id, totals] as const;
          })
        );

        setGameProgressById(Object.fromEntries(progressEntries));

        const earnedBadges = badgeData.badges.filter((badge) => badge.isEarned).length;
        const moduleStats = badgeData.moduleStats?.english;
        setStats({
          level: Math.max(1, Math.floor((moduleStats?.finishedAttempts ?? 0) / 5) + 1),
          stars: moduleStats?.totalStars ?? 0,
          achievements: earnedBadges,
        });
      } catch (e: any) {
        setError(e.message ?? "Error");
      } finally {
        setLoading(false);
      }
    }

    load().catch((e: any) => setError(e.message ?? "Error"));
  }, []);

  const emptyState = useMemo(() => !loading && games.length === 0, [games.length, loading]);

  return (
    <div className={styles.page}>
      <div className={styles.bg} />
      <div className={styles.overlay} />

      <header className={styles.topBar}>
        <Link href="/child/subjects" className={styles.backBtn}>
          <span className={styles.backIcon}>←</span>
          Назад
        </Link>
      </header>

      <main className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Планета Англійська</h1>
          <div className={styles.titleGlow} />
          <p className={styles.subtitle}>
            Привіт, <b>{loading ? "..." : childName}</b>! Обирай гру та вивчай нові слова.
          </p>
        </div>

        <section className={styles.cardsWrap}>
          {games.map((game, index) => {
            const progress = gameProgressById[game.id] ?? { totalLevels: 0, completedLevels: 0 };

            return (
            <div key={game.id} className={styles.card}>
              <div className={styles.cardInner}>
                <div className={styles.cardArt}>
                  <Image
                    src={getGameCardImage(game, index)}
                    alt={game.title}
                    width={260}
                    height={200}
                    className={styles.cardImg}
                    sizes="(max-width: 520px) 72vw, (max-width: 1024px) 56vw, 260px"
                    priority={index === 0}
                  />
                </div>

                <div className={styles.cardText}>
                  <h3 className={styles.cardTitle}>{game.title}</h3>
                  <p className={styles.cardSubtitle}>Всього рівнів: {progress.totalLevels}. Пройдено: {progress.completedLevels}.</p>
                </div>

                <Link href={`/child/game/${game.id}/difficulty`} className={styles.playBtn}>
                  Грати
                </Link>
              </div>
            </div>
          );
          })}
        </section>

        {emptyState && <p className={styles.subtitle}>Поки немає ігор з англійської для цієї вікової групи.</p>}
        {error && <p className={styles.subtitle}>{error}</p>}

        <section className={styles.statsBar}>
          <div className={styles.statItem}>
            <div className={styles.statIcon}><Image src="/levels.png" alt="Рівень" width={34} height={34} /></div>
            <div className={styles.statMeta}>
              <div className={styles.statLabel}>Рівень</div>
              <div className={styles.statValue}>{stats.level}</div>
            </div>
          </div>

          <div className={styles.statDivider} />

          <div className={styles.statItem}>
            <div className={styles.statIcon}><Image src="/star.png" alt="Зірочки" width={34} height={34} /></div>
            <div className={styles.statMeta}>
              <div className={styles.statLabel}>Зірочок</div>
              <div className={styles.statValue}>{stats.stars}</div>
            </div>
          </div>

          <div className={styles.statDivider} />

          <div className={styles.statItem}>
            <div className={styles.statIcon}><Image src="/trophy.png" alt="Досягнення" width={34} height={34} /></div>
            <div className={styles.statMeta}>
              <div className={styles.statLabel}>Досягнень</div>
              <div className={styles.statValue}>{stats.achievements}</div>
            </div>
          </div>
        </section>

        <div className={styles.cornerPlanet}>
          <Image
            src="/Child_menu/planet_english_language.png"
            alt="English Planet"
            width={260}
            height={220}
            className={styles.cornerPlanetImg}
          />
        </div>
      </main>
    </div>
  );
}
