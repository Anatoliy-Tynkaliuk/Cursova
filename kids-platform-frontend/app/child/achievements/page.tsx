/**
 * 📘 ОГЛЯД ФАЙЛУ: `kids-platform-frontend/app/child/achievements/page.tsx`.
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
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { getChildBadgesPublic, type ChildBadgeItem } from "@/lib/endpoints";
import { getChildSession } from "@/lib/auth";
import styles from "./ChildAchievementsPage.module.css";

// Функція: getBadgeProgress. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: getBadgeProgress. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
function getBadgeProgress(badge: ChildBadgeItem) {
  if (badge.progressPercent != null) return badge.progressPercent;
  if (badge.isEarned) return 100;
  return 0;
}

// Функція: getProgressText. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: getProgressText. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
function getProgressText(badge: ChildBadgeItem) {
  if (badge.currentValue != null && badge.targetValue != null) {
    return `${badge.currentValue}/${badge.targetValue}`;
  }
  return badge.isEarned ? "Виконано" : "0%";
}

// Функція: ChildAchievementsPage. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export default function ChildAchievementsPage() {
  const [badges, setBadges] = useState<ChildBadgeItem[]>([]);
  const [finishedAttempts, setFinishedAttempts] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const session = useMemo(
    () =>
      typeof window === "undefined"
        ? { childProfileId: null, ageGroupCode: null, childName: null }
        : getChildSession(),
    [],
  );

  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const childName = isHydrated ? (session.childName || "RocketMax") : "RocketMax";

  useEffect(() => {
    if (!session?.childProfileId) {
      window.location.href = "/child/join";
      return;
    }

// Функція: load. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: load. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
    async function load() {
      setError(null);
      try {
        const data = await getChildBadgesPublic(session.childProfileId);
        setBadges(data.badges ?? []);
        setFinishedAttempts(data.finishedAttempts ?? 0);
        setTotalStars(data.totalStars ?? 0);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Error");
      }
    }

    load().catch((e: unknown) => setError(e instanceof Error ? e.message : "Error"));
  }, [session?.childProfileId]);

  const earnedCount = useMemo(() => badges.filter((badge) => badge.isEarned).length, [badges]);
  const totalCount = badges.length;
  const progressPct = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Досягнення</h1>
          <Link className={styles.back} href="/child/subjects">
            ← Назад
          </Link>
        </header>

        <section className={styles.profile}>
          <div>
            <p className={styles.profileLabel}>Профіль гравця</p>
            <h2 className={styles.name}>{childName}</h2>
            <p className={styles.profileMeta}>
              Пройдено ігор: {finishedAttempts} · Зірочок: {totalStars}
            </p>
          </div>

          <div className={styles.progressBlock}>
            <div className={styles.progressText}>
              {earnedCount}/{totalCount || 0} отримано
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
            </div>
            <div className={styles.progressPercent}>{progressPct}%</div>
          </div>
        </section>

        {error && <div className={styles.error}>{error}</div>}

        {badges.length === 0 ? (
          <div className={styles.empty}>Поки що немає досягнень.</div>
        ) : (
          <section className={styles.grid}>
            {badges.map((badge) => {
              const progress = getBadgeProgress(badge);
              const bgSrc = badge.isEarned ? "/Achievements_page/completed_achievements.png" : "/Achievements_page/locked_achievements.png";

              return (
                <article
                  key={badge.id}
                  className={`${styles.card} ${badge.isEarned ? styles.cardEarned : styles.cardLocked}`}
                  title={badge.description || ""}
                >
                  <div className={styles.cardBg} aria-hidden="true">
                    <Image
                      src={bgSrc}
                      alt=""
                      fill
                      className={styles.cardBgImg}
                      priority={false}
                    />
                  </div>

                  <div className={styles.cardContent}>
                    <div className={styles.cardHead}>
                      <span className={styles.badgeStatus}>
                        {badge.isEarned ? "Отримано" : "Закрито"}
                      </span>

                      {!badge.isEarned && <span className={styles.chain} aria-hidden="true">⛓️</span>}
                    </div>

                    <h3 className={styles.cardTitle}>{badge.title}</h3>
                    <p className={styles.cardDesc}>
                      {badge.description || "Досягнення відкриється після виконання цілі."}
                    </p>

                    {badge.metricLabel && (
                      <div className={styles.metricRow}>
                        <span>{badge.metricLabel}</span>
                        <strong>{getProgressText(badge)}</strong>
                      </div>
                    )}

                    <div className={styles.progressLine}>
                      <div className={styles.progressLineFill} style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        <div className={styles.bottom}>
          <Link className={styles.allBtn} href="/child/achievements/all">
            Усі досягнення
          </Link>
        </div>
      </div>
    </div>
  );
}
