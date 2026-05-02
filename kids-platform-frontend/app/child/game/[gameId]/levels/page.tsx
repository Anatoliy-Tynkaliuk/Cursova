/**
 * 📘 ОГЛЯД ФАЙЛУ: `kids-platform-frontend/app/child/game/[gameId]/levels/page.tsx`.
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

import Link from "next/link";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getChildSession } from "@/lib/auth";
import { getGameLevels, type GameLevelsResponse } from "@/lib/endpoints";
import styles from "./GameLevelsPage.module.css";

const difficultyLabels: Record<number, string> = {
  1: "Легко",
  2: "Середньо",
  3: "Складно",
};

// Функція: normalizeDifficulty. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: normalizeDifficulty. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
function normalizeDifficulty(value: string | null): number | null {
  if (!value) return null;
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : null;
}

// Функція: GameLevelsPage. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export default function GameLevelsPage() {
  const params = useParams<{ gameId: string }>();
  const search = useSearchParams();

  const gameId = Number(params.gameId);
  const difficulty = normalizeDifficulty(search.get("difficulty"));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [levelsData, setLevelsData] = useState<GameLevelsResponse | null>(null);

  useEffect(() => {
    if (!Number.isFinite(gameId) || gameId <= 0) {
      window.location.href = "/child/subjects";
      return;
    }

    if (!difficulty) {
      window.location.href = `/child/game/${gameId}/difficulty`;
      return;
    }

    const session = getChildSession();
    const childProfileId = session.childProfileId;

    if (typeof childProfileId !== "number" || !session.ageGroupCode) {
      window.location.href = "/child/join";
      return;
    }

    const resolvedDifficulty = difficulty;
    const resolvedChildProfileId = childProfileId;

    let cancelled = false;

// Функція: loadData. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: loadData. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const data = await getGameLevels(gameId, resolvedDifficulty, resolvedChildProfileId);
        if (!cancelled) setLevelsData(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Сталася помилка");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [difficulty, gameId]);

  const levelLinks = useMemo(() => {
    if (!difficulty || !levelsData) return [];
    return levelsData.levels.map((item) => ({
      ...item,
      href: `/child/game/${gameId}?difficulty=${difficulty}&levelId=${item.levelId}`,
    }));
  }, [difficulty, gameId, levelsData]);

  return (
    <main className={styles.levelsPage}>
      <section className={styles.levelsCard}>
        <div className={styles.overlay} />

        <div className={styles.topActions}>
          <Link className={`${styles.btn} ${styles.btnPurple}`} href={`/child/game/${gameId}/difficulty`}>
            Інша складність
          </Link>

          <Link className={`${styles.btn} ${styles.btnBlue}`} href="/child/subjects">
            До планет
          </Link>
        </div>

        <header className={styles.levelsHeader}>
          <h1 className={styles.levelsTitle}>Рівні гри</h1>

          {loading ? (
            <p className={styles.levelsMuted}>Завантаження...</p>
          ) : error ? (
            <p className={styles.levelsMuted}>{error}</p>
          ) : (
            <>
              <p className={styles.levelsMeta}>
                Гра: <b>{levelsData?.gameTitle ?? `#${gameId}`}</b>
              </p>

              <p className={styles.levelsMeta}>
                Складність:{" "}
                <b>{difficulty ? difficultyLabels[difficulty] ?? `Рівень ${difficulty}` : "—"}</b>
              </p>

              <p className={styles.levelsHint}>Оберіть рівень цієї складності:</p>

              <div className={styles.levelList}>
                {levelLinks.map((item) => {
                  const iconSrc =
                    item.state === "completed"
                      ? "/completed.png"
                      : item.state === "locked"
                      ? "/locked.png"
                      : "/paused.png";

                  const iconAlt =
                    item.state === "completed"
                      ? "completed"
                      : item.state === "locked"
                      ? "locked"
                      : "play";

                  const nodeClass =
                    item.state === "completed"
                      ? `${styles.levelBtn} ${styles.completed}`
                      : item.state === "locked"
                      ? `${styles.levelBtn} ${styles.locked}`
                      : `${styles.levelBtn} ${styles.active}`;

// Функція: content. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: content. Локальний обробник подій/даних, який викликається з цього файлу або з JSX.
                  const content = (
                    <span className={styles.levelContent}>
                      <span className={styles.levelBgIcon}>
                        <Image
                          src={iconSrc}
                          alt={iconAlt}
                          width={90}
                          height={126}
                          className={styles.levelBgIconImg}
                        />
                      </span>

                      <span className={styles.levelLabel}>Рівень {item.level}</span>
                    </span>
                  );

                  if (item.isLocked) {
                    return (
                      <div key={item.level} className={nodeClass}>
                        {content}
                      </div>
                    );
                  }

                  return (
                    <Link key={item.level} href={item.href} className={nodeClass}>
                      {content}
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </header>
      </section>
    </main>
  );
}
