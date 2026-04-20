"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getChildBadges,
  getChildStats,
  type ChildBadgeItem,
  type ChildStats,
} from "@/lib/endpoints";
import { isLoggedIn } from "@/lib/auth";
import styles from "./ChildStatsPage.module.css";

function getBadgeProgress(badge: ChildBadgeItem) {
  if (badge.progressPercent != null) return badge.progressPercent;
  if (badge.isEarned) return 100;
  return 0;
}

function getProgressText(badge: ChildBadgeItem) {
  if (badge.currentValue != null && badge.targetValue != null) {
    return `${badge.currentValue}/${badge.targetValue}`;
  }
  return badge.isEarned ? "Виконано" : "0%";
}

export default function ChildStatsPage() {
  const params = useParams<{ childId: string }>();
  const childId = Number(params.childId);

  const [stats, setStats] = useState<ChildStats | null>(null);
  const [badges, setBadges] = useState<ChildBadgeItem[]>([]);
  const [finishedAttempts, setFinishedAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = "/login";
      return;
    }

    if (!childId) {
      setError("Невірний ідентифікатор дитини");
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [data, badgeData] = await Promise.all([getChildStats(childId), getChildBadges(childId)]);
        setStats(data);
        setBadges(badgeData.badges ?? []);
        setFinishedAttempts(badgeData.finishedAttempts ?? 0);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Error");
      } finally {
        setLoading(false);
      }
    }

    load().catch((e: unknown) => setError(e instanceof Error ? e.message : "Error"));
  }, [childId]);

  const earnedCount = useMemo(() => badges.filter((badge) => badge.isEarned).length, [badges]);
  const totalCount = badges.length;
  const progressPct = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Досягнення дитини</h1>
          <Link className={styles.back} href="/parent">
            ← Назад до кабінету
          </Link>
        </header>

        {loading && <p className={styles.status}>Завантаження...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {stats && (
          <>
            <section className={styles.profile}>
              <div>
                <p className={styles.profileLabel}>Профіль дитини</p>
                <h2 className={styles.name}>{stats.child.name}</h2>
                <p className={styles.profileMeta}>
                  Вік: {stats.child.ageGroupCode} · Завершено ігор: {finishedAttempts}
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

            {badges.length === 0 ? (
              <div className={styles.empty}>Поки що немає досягнень.</div>
            ) : (
              <section className={styles.grid}>
                {badges.map((badge) => {
                  const progress = getBadgeProgress(badge);
                  const bgSrc = badge.isEarned
                    ? "/Achievements_page/completed_achievements.png"
                    : "/Achievements_page/locked_achievements.png";

                  return (
                    <article
                      key={badge.id}
                      className={`${styles.card} ${badge.isEarned ? styles.cardEarned : styles.cardLocked}`}
                      title={badge.description || ""}
                    >
                      <div className={styles.cardBg} aria-hidden="true">
                        <Image src={bgSrc} alt="" fill className={styles.cardBgImg} priority={false} />
                      </div>

                      <div className={styles.cardContent}>
                        <div className={styles.cardHead}>
                          <span className={styles.badgeStatus}>
                            {badge.isEarned ? "Отримано" : "Закрито"}
                          </span>
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

            <section className={styles.statsSection}>
              <h2 className={styles.statsTitle}>Загальна статистика</h2>
              <ul className={styles.statsList}>
                <li>Спроб: {stats.summary.totalAttempts}</li>
                <li>Завершено: {stats.summary.finishedAttempts}</li>
                <li>Правильні відповіді: {stats.summary.totalCorrect}</li>
                <li>Запитань: {stats.summary.totalQuestions}</li>
                <li>Бали: {stats.summary.totalScore}</li>
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
