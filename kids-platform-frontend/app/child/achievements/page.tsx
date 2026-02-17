"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { getChildBadgesPublic, type ChildBadgeItem } from "@/lib/endpoints";
import { getChildSession } from "@/lib/auth";
import styles from "./ChildAchievementsPage.module.css";

type Summary = {
  finishedAttempts: number;
  totalStars: number;
  loginDays: number;
  correctAnswers: number;
  perfectGames: number;
};

function getBadgeProgress(badge: ChildBadgeItem) {
  if (badge.progressPercent != null) return badge.progressPercent;
  if (badge.isEarned) return 100;
  return 0;
}

export default function ChildAchievementsPage() {
  const [badges, setBadges] = useState<ChildBadgeItem[]>([]);
  const [summary, setSummary] = useState<Summary>({
    finishedAttempts: 0,
    totalStars: 0,
    loginDays: 0,
    correctAnswers: 0,
    perfectGames: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const session = useMemo(() => (
    typeof window === "undefined"
      ? { childProfileId: null, ageGroupCode: null, childName: null }
      : getChildSession()
  ), []);
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

    async function load() {
      setError(null);
      try {
        const data = await getChildBadgesPublic(session.childProfileId);
        setBadges(data.badges ?? []);
        setSummary({
          finishedAttempts: data.finishedAttempts ?? 0,
          totalStars: data.totalStars ?? 0,
          loginDays: data.loginDays ?? 0,
          correctAnswers: data.correctAnswers ?? 0,
          perfectGames: data.perfectGames ?? 0,
        });
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Error");
      }
    }

    load().catch((e: unknown) => setError(e instanceof Error ? e.message : "Error"));
  }, [session?.childProfileId]);

  const earned = useMemo(() => badges.filter((badge) => badge.isEarned), [badges]);
  const inProgress = useMemo(() => badges.filter((badge) => !badge.isEarned && getBadgeProgress(badge) > 0), [badges]);
  const locked = useMemo(() => badges.filter((badge) => !badge.isEarned && getBadgeProgress(badge) === 0), [badges]);

  const completionRate = badges.length === 0 ? 0 : Math.round((earned.length / badges.length) * 100);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Досягнення</h1>
          <Link className={styles.back} href="/child/subjects">
            ← Назад
          </Link>
        </header>

        <section className={styles.hero}>
          <div>
            <p className={styles.heroLabel}>Профіль</p>
            <h2 className={styles.name}>{childName}</h2>
            <p className={styles.heroText}>Твій прогрес у професійному форматі: виконані, у процесі та заплановані досягнення.</p>
          </div>

          <div className={styles.progressWrap}>
            <div className={styles.progressMeta}>{earned.length}/{badges.length || 0} отримано</div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${completionRate}%` }} />
            </div>
            <div className={styles.progressPercent}>{completionRate}%</div>
          </div>
        </section>

        <section className={styles.kpiGrid}>
          <article className={styles.kpiCard}><span>⭐ Зірки</span><strong>{summary.totalStars}</strong></article>
          <article className={styles.kpiCard}><span>🎮 Пройдені ігри</span><strong>{summary.finishedAttempts}</strong></article>
          <article className={styles.kpiCard}><span>📅 Дні активності</span><strong>{summary.loginDays}</strong></article>
          <article className={styles.kpiCard}><span>✅ Правильні відповіді</span><strong>{summary.correctAnswers}</strong></article>
          <article className={styles.kpiCard}><span>🏆 Ідеальні ігри</span><strong>{summary.perfectGames}</strong></article>
        </section>

        {error && <div className={styles.error}>{error}</div>}

        <section className={styles.section}>
          <div className={styles.sectionHead}><h3>Отримані</h3><span>{earned.length}</span></div>
          <div className={styles.list}>{earned.map((badge) => <BadgeCard key={badge.id} badge={badge} />)}</div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}><h3>У процесі</h3><span>{inProgress.length}</span></div>
          <div className={styles.list}>{inProgress.map((badge) => <BadgeCard key={badge.id} badge={badge} />)}</div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}><h3>Ще закриті</h3><span>{locked.length}</span></div>
          <div className={styles.list}>{locked.map((badge) => <BadgeCard key={badge.id} badge={badge} />)}</div>
        </section>

        <div className={styles.bottom}>
          <Link className={styles.allBtn} href="/child/achievements/all">Усі досягнення</Link>
        </div>
      </div>
    </div>
  );
}

function BadgeCard({ badge }: { badge: ChildBadgeItem }) {
  const progress = getBadgeProgress(badge);
  const progressText =
    badge.currentValue != null && badge.targetValue != null
      ? `${badge.currentValue}/${badge.targetValue}`
      : badge.isEarned
        ? "Виконано"
        : "Немає прогресу";

  return (
    <article className={`${styles.card} ${badge.isEarned ? styles.cardEarned : ""}`}>
      <div className={styles.cardTop}>
        <div>
          <h4>{badge.title}</h4>
          <p>{badge.description || "Досягнення буде відкрито після виконання умов."}</p>
        </div>
        <span className={styles.status}>{badge.isEarned ? "Отримано" : "Активне"}</span>
      </div>

      {badge.metricLabel && (
        <div className={styles.metricRow}>
          <span>{badge.metricLabel}</span>
          <strong>{progressText}</strong>
        </div>
      )}

      <div className={styles.line}>
        <div className={styles.lineFill} style={{ width: `${progress}%` }} />
      </div>
    </article>
  );
}
