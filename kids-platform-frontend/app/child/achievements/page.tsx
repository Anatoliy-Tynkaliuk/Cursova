"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { getChildBadgesPublic, type ChildBadgeItem } from "@/lib/endpoints";
import { getChildSession } from "@/lib/auth";
import styles from "./ChildAchievementsPage.module.css";

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
            <div className={styles.progressText}>{earnedCount}/{totalCount || 0} отримано</div>
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

              return (
                <article
                  key={badge.id}
                  className={`${styles.card} ${badge.isEarned ? styles.cardEarned : styles.cardLocked}`}
                  title={badge.description || ""}
                >
                  <div className={styles.cardHead}>
                    <div className={styles.badgeImageWrap}>
                      <Image
                        src={badge.isEarned ? "/landing/trophy.png" : "/landing/shield.png"}
                        alt={badge.isEarned ? "Отримане досягнення" : "Закрите досягнення"}
                        width={52}
                        height={52}
                        className={styles.badgeImage}
                      />
                      {!badge.isEarned && <span className={styles.chain}>⛓️</span>}
                    </div>
                    <span className={styles.badgeStatus}>{badge.isEarned ? "Отримано" : "Закрито"}</span>
                  </div>

                  <h3 className={styles.cardTitle}>{badge.title}</h3>
                  <p className={styles.cardDesc}>{badge.description || "Досягнення відкриється після виконання цілі."}</p>

                  {badge.metricLabel && (
                    <div className={styles.metricRow}>
                      <span>{badge.metricLabel}</span>
                      <strong>{getProgressText(badge)}</strong>
                    </div>
                  )}

                  <div className={styles.progressLine}>
                    <div className={styles.progressLineFill} style={{ width: `${progress}%` }} />
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
