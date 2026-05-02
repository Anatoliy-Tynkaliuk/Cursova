/**
 * 📘 ОГЛЯД ФАЙЛУ: `kids-platform-frontend/app/child/logic/page.tsx`.
 * ЩО ЦЕ: цей файл — частина навчальної платформи для дітей (бекенд API або фронтенд-екран).
 * НАВІЩО: реалізує конкретний шмат логіки (дані, перевірки, маршрути, або відображення інтерфейсу).
 * ЯК ПРАЦЮЄ: імпортує залежності, приймає вхідні дані, обробляє їх, та повертає результат/HTML/API-відповідь.
 * ВЗАЄМОДІЯ З ІНШИМИ ФАЙЛАМИ: через import/export, виклики сервісів, DTO, props, HTTP-запити.
 * ГЛОСАРІЙ:
 * - API: правила обміну даними між клієнтом (фронтенд) і сервером (бекенд).
 * - DTO: структура даних, яку дозволено приймати/повертати.
 * - Service: шар бізнес-логіки (обчислення, перевірки, робота з БД).
 * - Controller/Page: точка входу запиту користувача або сторінка інтерфейсу.
 * - Component: перевикористовуваний UI-блок.
 * - Prisma/ORM: інструмент доступу до бази даних через код.
 */


"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./logic.module.css";
import { useEffect, useMemo, useState } from "react";
import { getChildSession } from "@/lib/auth";
import { getChildBadgesPublic, getGames, type ChildBadgeItem, type GameListItem } from "@/lib/endpoints";

type ChildStats = {
  level: number;
  stars: number;
  achievements: number;
};

const cardImages = [
  "/Planeta_logika/background_games_match.png",
  "/Planeta_logika/background_games_test.png",
  "/Planeta_logika/background_games_dragging.png",
];

// Функція: LogicPlanetPage. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export default function LogicPlanetPage() {
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

// Функція: loadData. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: loadData. Локальний обробник подій/даних, який викликається з цього файлу або з JSX.
    const loadData = async () => {
      try {
        const [badgeData, gamesData] = await Promise.all([
          getChildBadgesPublic(session.childProfileId!),
          getGames(session.ageGroupCode!),
        ]);

        const finishedAttempts = badgeData.finishedAttempts;
        const earnedBadges = badgeData.badges.filter((badge: ChildBadgeItem) => badge.isEarned).length;
        const logicGames = gamesData.filter((game) => game.moduleCode === "logic");
        setGames(logicGames);

        setStats({
          level: Math.max(1, Math.floor(finishedAttempts / 5) + 1),
          stars: finishedAttempts,
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
                  <p className={styles.cardSubtitle}>Натисни “Грати”, щоб обрати складність на наступному екрані.</p>
                </div>

                <Link href={`/child/game/${game.id}/difficulty`} className={styles.playBtn}>
                  Грати
                </Link>
              </div>
            </div>
          ))}
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
