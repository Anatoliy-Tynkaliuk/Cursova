"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./english.module.css";
import { getChildBadgesPublic, getGames, type GameListItem } from "@/lib/endpoints";
import { getChildSession } from "@/lib/auth";

const cardImages = [
  "/Planeta_logika/background_games_match.png",
  "/Planeta_logika/background_games_test.png",
  "/Planeta_logika/background_games_dragging.png",
];

type ChildStats = {
  level: number;
  stars: number;
  achievements: number;
};

export default function EnglishPlanetPage() {
  const [childName, setChildName] = useState("Друже");
  const [stats, setStats] = useState<ChildStats>({ level: 1, stars: 0, achievements: 0 });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<GameListItem[]>([]);

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
        const earnedBadges = badgeData.badges.filter((badge) => badge.isEarned).length;
        setStats({
          level: Math.max(1, Math.floor(badgeData.finishedAttempts / 5) + 1),
          stars: badgeData.finishedAttempts,
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
          {games.map((game, index) => (
            <div key={game.id} className={styles.card}>
              <div className={styles.cardInner}>
                <div className={styles.cardArt}>
                  <Image
                    src={cardImages[index % cardImages.length]}
                    alt={game.title}
                    width={260}
                    height={200}
                    className={styles.cardImg}
                    priority={index === 0}
                  />
                </div>

                <div className={styles.cardText}>
                  <h3 className={styles.cardTitle}>{game.title}</h3>
                  <p className={styles.cardSubtitle}>Складність: {game.difficulty}</p>
                </div>

                <Link href={`/child/game/${game.id}`} className={styles.playBtn}>
                  Грати
                </Link>
              </div>
            </div>
          ))}
        </section>

        {emptyState && <p className={styles.subtitle}>Поки немає ігор з англійської для цієї вікової групи.</p>}
        {error && <p className={styles.subtitle}>{error}</p>}

        <section className={styles.statsBar}>
          <div className={styles.statItem}>
            <div className={styles.statIcon}>⭐</div>
            <div className={styles.statMeta}>
              <div className={styles.statLabel}>Рівень</div>
              <div className={styles.statValue}>{stats.level}</div>
            </div>
          </div>

          <div className={styles.statDivider} />

          <div className={styles.statItem}>
            <div className={styles.statIcon}>✨</div>
            <div className={styles.statMeta}>
              <div className={styles.statLabel}>Зірочок</div>
              <div className={styles.statValue}>{stats.stars}</div>
            </div>
          </div>

          <div className={styles.statDivider} />

          <div className={styles.statItem}>
            <div className={styles.statIcon}>🏆</div>
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
