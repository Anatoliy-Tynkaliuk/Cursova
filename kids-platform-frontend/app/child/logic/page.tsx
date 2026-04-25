"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./logic.module.css";
import { useEffect, useMemo, useState } from "react";
import { getChildSession } from "@/lib/auth";
import {
  getChildBadgesPublic,
  getGameLevels,
  getGames,
  type ChildBadgeItem,
  type GameListItem,
} from "@/lib/endpoints";

type ChildStats = {
  level: number;
  stars: number;
  achievements: number;
};

type GameProgress = {
  totalLevels: number;
  completedLevels: number;
};

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

export default function LogicPlanetPage() {
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

    const loadData = async () => {
      try {
        const [badgeData, gamesData] = await Promise.all([
          getChildBadgesPublic(session.childProfileId!),
          getGames(session.ageGroupCode!),
        ]);

        const moduleStats = badgeData.moduleStats?.logic;
        const finishedAttempts = moduleStats?.finishedAttempts ?? 0;
        const earnedBadges = badgeData.badges.filter((badge: ChildBadgeItem) => badge.isEarned).length;
        const logicGames = gamesData.filter((game) => game.moduleCode === "logic");
        setGames(logicGames);

        const progressEntries = await Promise.all(
          logicGames.map(async (game) => {
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

        setStats({
          level: Math.max(1, Math.floor(finishedAttempts / 5) + 1),
          stars: moduleStats?.totalStars ?? 0,
          achievements: earnedBadges,
        });

        if (logicGames.length === 0) {
          setError("Поки немає доступних ігор з логіки для цієї вікової групи.");
        }
      } catch (err: any) {
        setError(err.message ?? "Error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const emptyState = useMemo(() => !loading && games.length === 0, [games.length, loading]);

  return (
    <div className={styles.page}>
      {/* BACKGROUND */}
      <div className={styles.bg} />
      <div className={styles.overlay} />

      {/* TOP BAR */}
      <header className={styles.topBar}>
        <Link href="/child/subjects" className={styles.backBtn}>
          <span className={styles.backIcon}>←</span>
          Назад
        </Link>
      </header>

      {/* CONTENT */}
      <main className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Планета Логіки</h1>
          <div className={styles.titleGlow} />
          <p className={styles.subtitle}>
            Привіт, <b>{loading ? "..." : childName}</b>! Обирай спосіб навчання та починай гру.
          </p>
        </div>

        {/* GAME CARDS */}
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
                      fill
                      className={styles.cardImg}
                      sizes="(max-width: 1024px) 100vw, 33vw"
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

        {emptyState && <p className={styles.subtitle}>Поки немає доступних ігор.</p>}
        {error && <p className={styles.subtitle}>{error}</p>}

        {/* STATS BAR */}
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


        {/* DECOR PLANET (нижній правий як на фото) */}
        <div className={styles.cornerPlanet}>
          <Image
            src="/Child_menu/planet_of_logic.png"
            alt="Logic Planet"
            width={260}
            height={220}
            className={styles.cornerPlanetImg}
          />
        </div>
      </main>
    </div>
  );
}
