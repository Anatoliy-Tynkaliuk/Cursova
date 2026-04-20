"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getChildBadges, getChildStats, type ChildBadgeItem, type ChildStats } from "@/lib/endpoints";
import { isLoggedIn } from "@/lib/auth";
import styles from "./page.module.css";

export default function ChildStatsPage() {
  const params = useParams<{ childId: string }>();
  const childId = Number(params.childId);
  const [stats, setStats] = useState<ChildStats | null>(null);
  const [badges, setBadges] = useState<ChildBadgeItem[]>([]);
  const [finishedAttempts, setFinishedAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function parseThreshold(code: string) {
    const match = code.match(/^FINISHED_(\d+)$/i);
    if (!match) return null;
    const value = Number(match[1]);
    return Number.isFinite(value) ? value : null;
  }

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
        setBadges(badgeData.badges);
        setFinishedAttempts(badgeData.finishedAttempts);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Error");
      } finally {
        setLoading(false);
      }
    }

    load().catch((e: unknown) => setError(e instanceof Error ? e.message : "Error"));
  }, [childId]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Статистика дитини</h1>
        <div className={styles.backWrap}>
          <Link className={styles.backLink} href="/parent">
            ← Назад до кабінету
          </Link>
        </div>

        {loading && <p className={styles.loading}>Завантаження...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {stats && (
          <>
            <div className={styles.panel}>
              <div className={styles.childName}>{stats.child.name}</div>
              <div className={styles.childAge}>Вік: {stats.child.ageGroupCode}</div>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Спроб</span>
                  <span className={styles.summaryValue}>{stats.summary.totalAttempts}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Завершено</span>
                  <span className={styles.summaryValue}>{stats.summary.finishedAttempts}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Правильні відповіді</span>
                  <span className={styles.summaryValue}>{stats.summary.totalCorrect}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Запитань</span>
                  <span className={styles.summaryValue}>{stats.summary.totalQuestions}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Бали</span>
                  <span className={styles.summaryValue}>{stats.summary.totalScore}</span>
                </div>
              </div>
            </div>

            <section className={styles.panel}>
              <h2 className={styles.sectionTitle}>Досягнення</h2>
              <p className={styles.subInfo}>Завершено ігор: {finishedAttempts}</p>

              {badges.length === 0 ? (
                <p className={styles.empty}>Поки що немає досягнень.</p>
              ) : (
                <ul className={styles.badgesList}>
                  {badges.map((badge) => (
                    <li
                      key={badge.id}
                      className={`${styles.badgeItem} ${badge.isEarned ? "" : styles.badgeLocked}`}
                    >
                      <div className={styles.badgeTitle}>
                        {badge.icon ? `${badge.icon} ` : ""}
                        {badge.title}
                      </div>
                      {badge.description && <div className={styles.badgeDesc}>{badge.description}</div>}
                      {parseThreshold(badge.code) != null && (
                        <div className={styles.badgeMeta}>
                          Потрібно завершених ігор: {parseThreshold(badge.code)}
                        </div>
                      )}
                      <div className={styles.badgeState}>{badge.isEarned ? "Отримано ✅" : "Ще не отримано"}</div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className={styles.panel}>
              <h2 className={styles.sectionTitle}>Останні ігри</h2>
              {stats.attempts.length === 0 ? (
                <p className={styles.empty}>Ще немає спроб.</p>
              ) : (
                <ul className={styles.attemptsList}>
                  {stats.attempts.map((attempt) => (
                    <li key={attempt.id} className={styles.attemptItem}>
                      <div className={styles.attemptTitle}>{attempt.game.title}</div>
                      <div className={styles.attemptModule}>module: {attempt.game.moduleCode}</div>
                      <div className={styles.attemptResult}>
                        Результат: {attempt.correctCount}/{attempt.totalCount} | Бали: {attempt.score}
                      </div>
                      <div className={styles.attemptStatus}>{attempt.isFinished ? "Завершено" : "У процесі"}</div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
