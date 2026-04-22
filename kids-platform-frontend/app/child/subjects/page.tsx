"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getChildBadgesPublic, getGames, type ChildBadgeItem, type GameListItem } from "@/lib/endpoints";
import { getChildSession } from "@/lib/auth";
import styles from "./ChildSubjectsPage.module.css";

type Subject = {
  key: "logic" | "math" | "english";
  title: string;
  image: string;
  href: string;
};

const subjects: Subject[] = [
  {
    key: "logic",
    title: "Планета Логіки",
    image: "/Child_menu/planet_of_logics.png",
    href: "/child/logic",
  },
  {
    key: "math",
    title: "Планета Математика",
    image: "/Child_menu/planet_mathematic.png",
    href: "/child/math",
  },
  {
    key: "english",
    title: "Планета Англійська",
    image: "/Child_menu/planet_english_languages.png",
    href: "/child/english",
  },
];

export default function ChildSubjectsPage() {
  const [games, setGames] = useState<GameListItem[]>([]);
  const [badges, setBadges] = useState<ChildBadgeItem[]>([]);
  const [finishedAttempts, setFinishedAttempts] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [childName, setChildName] = useState<string>("Друже");
  const [childAvatar, setChildAvatar] = useState<string>("👨‍🚀");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getChildSession();
    if (!session.childProfileId || !session.ageGroupCode) {
      window.location.href = "/child/join";
      return;
    }
    setChildName(session.childName || "Друже");
    setChildAvatar(session.childAvatar || "👨‍🚀");

    async function load() {
      setError(null);
      try {
        const [gamesData, badgeData] = await Promise.all([
          getGames(session.ageGroupCode!),
          getChildBadgesPublic(session.childProfileId!),
        ]);
        setGames(gamesData);
        setBadges(badgeData.badges);
        setFinishedAttempts(badgeData.finishedAttempts);
        setTotalStars(badgeData.totalStars ?? badgeData.finishedAttempts);
      } catch (e: any) {
        setError(e.message ?? "Error");
      }
    }

    load().catch((e: any) => setError(e.message ?? "Error"));
  }, []);

  const gamesByModule = useMemo(() => {
    return games.reduce<Record<string, number>>((acc, game) => {
      acc[game.moduleCode] = (acc[game.moduleCode] ?? 0) + 1;
      return acc;
    }, {});
  }, [games]);

  const earnedBadges = useMemo(() => badges.filter((badge) => badge.isEarned).length, [badges]);
  const level = useMemo(() => Math.max(1, Math.floor(finishedAttempts / 5) + 1), [finishedAttempts]);

  const stats = [
    { label: "Рівень", value: String(level), iconSrc: "/levels.png", iconAlt: "Рівень" },
    { label: "Зірочки", value: String(totalStars), iconSrc: "/star.png", iconAlt: "Зірочки" },
    {
      label: "Досягнення",
      value: String(earnedBadges),
      iconSrc: "/trophy.png",
      iconAlt: "Досягнення",
    },
  ];

  return (
    <div className={styles.page}>
      <Image
        src="/background.png"
        alt="space background"
        fill
        priority
        className={styles.bgImg}
      />
      <div className={styles.overlay} />

      <div className={styles.container}>
        <header className={styles.topBar}>
          <Link href="/child/avatar-shop" className={styles.avatarLink} title="Магазин аватарів">
            <span className={styles.avatarEmoji}>{childAvatar}</span>
          </Link>
          <Link href="/child" className={styles.backBtn}>Назад</Link>
        </header>

        <h1 className={styles.greeting}>Привіт, {childName}!</h1>
        <section className={styles.panel}>
          <div className={styles.planetsGrid}>
            {subjects.map((s) => (
              <Link key={s.key} href={s.href} className={styles.planetCard}>
                <Image src={s.image} alt={s.title} fill className={styles.planetBg} />
                <div className={styles.planetOverlay} />

                <div className={styles.planetContent}>
                  <div className={styles.planetTitle}>{s.title}</div>
                  <div className={styles.planetHint}>
                    Доступно ігор: {gamesByModule[s.key] ?? 0}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {error && <p style={{ color: "salmon", marginTop: 12 }}>{error}</p>}
        </section>

        <section className={styles.statsPanel}>
          <div className={styles.statsGrid}>
            {stats.map((st) => (
              <div key={st.label} className={styles.statCard}>
                   <div className={styles.statIcon}>
                  <Image src={st.iconSrc} alt={st.iconAlt} width={45} height={45} />
                </div>
                <div className={styles.statText}>
                  <div className={styles.statLabel}>{st.label}</div>
                  <div className={styles.statValue}>{st.value}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.bottom}>
          <div className={styles.bottomCard}>
            <div className={styles.bottomTitle}>Нові місії вже чекають</div>

            <div className={styles.bottomText}>
              Обирай планету, збирай зірочки та відкривай нові досягнення!
            </div>

            <div className={styles.bottomLinks}>
              <Link href="/child/achievements" className={styles.smallBtn}>
                Досягнення
              </Link>
              <Link href="/child/activity" className={styles.smallBtn}>
                Активність
              </Link>
              <Link href="/child/profile" className={styles.smallBtn}>
                Профіль
              </Link>
              <Link href="/child/settings" className={styles.smallBtn}>
                Налаштування
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
