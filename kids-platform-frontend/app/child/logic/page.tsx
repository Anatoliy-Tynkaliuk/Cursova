"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./logic.module.css";
import { useEffect, useMemo, useState } from "react";

type ChildStats = {
  level: number;
  stars: number;
  achievements: number;
};

type PlanetLogicResponse = {
  childName: string;
  stats: ChildStats;
};

type ModeCard = {
  key: "match" | "test" | "drag";
  title: string;
  subtitle: string;
  href: string;
  // локальні іконки/картинки (можеш замінити на свої)
  icon: "logic" | "test" | "drag";
};

export default function LogicPlanetPage() {
  const [data, setData] = useState<PlanetLogicResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // 1) ПІДСТАВ СВІЙ BACKEND ENDPOINT
  // Наприклад: /api/child/planet/logic або http://localhost:3001/api/child/logic
  const endpoint = "/api/child/planet/logic";

  useEffect(() => {
  const loadData = async () => {
    try {
      const res = await fetch("/api/child/planet/logic", {
        credentials: "include", // якщо auth через cookie/session
      });

      if (!res.ok) throw new Error("Backend error");

      const json = await res.json();
      setData(json);

    } catch (error) {
      console.error("Failed to load child data:", error);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);


  const modes: ModeCard[] = useMemo(
    () => [
      {
        key: "match",
        title: "Зіставлення",
        subtitle: "Знаходь пари предметів",
        href: "/child/logic/match",
        icon: "logic",
      },
      {
        key: "test",
        title: "Тест",
        subtitle: "Відповідай на запитання",
        href: "/child/logic/test",
        icon: "test",
      },
      {
        key: "drag",
        title: "Перетягування",
        subtitle: "Переміщай елементи",
        href: "/child/logic/drag",
        icon: "drag",
      },
    ],
    []
  );

  const childName = data?.childName || "";

  const stats = data?.stats ?? { level: 0, stars: 0, achievements: 0 };

  return (
    <div className={styles.page}>
      {/* BACKGROUND */}
      <div className={styles.bg} />
      <div className={styles.overlay} />

      {/* TOP BAR */}
      <header className={styles.topBar}>
        <Link href="/child" className={styles.backBtn}>
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

        {/* MODE CARDS */}
        <section className={styles.cardsWrap}>
          {modes.map((m) => (
            <div key={m.key} className={styles.card}>
              <div className={styles.cardInner}>
                <div className={styles.cardArt}>
                  {/* Тут можеш підключити свої PNG з планетами/іконками */}
                  {m.icon === "logic" && (
                    <Image
                      src="/Planeta_logika/background_games_match.png"
                      alt="Зіставлення"
                      width={260}
                      height={200}
                      className={styles.cardImg}
                      priority
                    />
                  )}

                  {m.icon === "test" && (
                    <Image
                      src="/Planeta_logika/background_games_test.png"
                      alt="Тест"
                      width={260}
                      height={200}
                      className={styles.cardImg}
                    />
                  )}

                  {m.icon === "drag" && (
                    <Image
                      src="/Planeta_logika/background_games_dragging.png"
                      alt="Перетягування"
                      width={260}
                      height={200}
                      className={styles.cardImg}
                    />
                  )}
                </div>

                <div className={styles.cardText}>
                  <h3 className={styles.cardTitle}>{m.title}</h3>
                  <p className={styles.cardSubtitle}>{m.subtitle}</p>
                </div>

                <Link href={m.href} className={styles.playBtn}>
                  Грати
                </Link>
              </div>
            </div>
          ))}
        </section>

        {/* STATS BAR */}
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

        {/* DECOR PLANET (нижній правий як на фото) */}
        <div className={styles.cornerPlanet}>
          <Image
            src="/assets/planets/logic-planet.png"
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
