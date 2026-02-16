"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { getChildBadgesPublic, type ChildBadgeItem } from "@/lib/endpoints";
import { getChildSession } from "@/lib/auth";
import styles from "./ChildAchievementsPage.module.css";

const MAX_ON_PAGE = 6;

type AchievementBadgeView = ChildBadgeItem & {
  rating?: number;
  imageUrl?: string | null;
};

function parseThreshold(code: string) {
  const match = code.match(/^FINISHED_(\d+)$/i);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export default function ChildAchievementsPage() {
  const [badges, setBadges] = useState<ChildBadgeItem[]>([]);
  const [finishedAttempts, setFinishedAttempts] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const session = useMemo(() => getChildSession(), []);
  const childName = session.childName || "RocketMax";

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

  const earnedCount = useMemo(() => badges.filter((b) => b.isEarned).length, [badges]);
  const totalCount = badges.length;

  const showBadges = useMemo(() => badges.slice(0, MAX_ON_PAGE), [badges]);
  const hasMore = badges.length > MAX_ON_PAGE;

  const progressPct = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  return (
    <div className={styles.page}>
      <div className={styles.moon} aria-hidden />
      <div className={styles.rocket} aria-hidden />

      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Мої досягнення</h1>
          <Link className={styles.back} href="/child/subjects">
            ← Назад
          </Link>
        </header>

        <section className={styles.profile}>
          <div className={styles.avatarWrap}>
            <Image
              src="/avatars/child-astronaut.png"
              alt="avatar"
              width={92}
              height={92}
              className={styles.avatar}
              priority
            />
            <div className={styles.avatarGlow} aria-hidden />
          </div>

          <div className={styles.profileInfo}>
            <div className={styles.name}>{childName}</div>

            <div className={styles.progressRow}>
              <div className={styles.progressText}>
                {earnedCount}/{totalCount || 0} <span>досягнень</span>
              </div>

              <div
                className={styles.progressBar}
                role="progressbar"
                aria-valuenow={progressPct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
              </div>

              <div className={styles.subNote}>
                Завершено ігор: {finishedAttempts} &nbsp;|&nbsp; Зірочок: {totalStars}
              </div>
            </div>
          </div>
        </section>

        {error && <div className={styles.error}>{error}</div>}

        {badges.length === 0 ? (
          <div className={styles.empty}>Поки що немає досягнень.</div>
        ) : (
          <>
            <section className={styles.grid}>
              {showBadges.map((b) => {
                const locked = !b.isEarned;

                // якщо на бекенді немає rating — робимо: earned=3, locked=0
                const rating = clamp((b as AchievementBadgeView).rating ?? (b.isEarned ? 3 : 0), 0, 3);
                const threshold = parseThreshold(b.code);

                return (
                  <article
                    key={b.id}
                    className={`${styles.card} ${locked ? styles.cardLocked : ""}`}
                    title={b.description || ""}
                  >
                    <div className={styles.cardInner}>
                      <div className={styles.cardIcon}>
                        {locked ? (
                          <div className={styles.lockShield} aria-hidden />
                        ) : (
                          <Image
                            src={(b as AchievementBadgeView).imageUrl || "/achievements/badge-default.png"}
                            alt=""
                            width={92}
                            height={92}
                            className={styles.badgeImg}
                          />
                        )}
                      </div>

                      <div className={styles.cardTitle}>{locked ? "Не досягнуто" : b.title}</div>

                      {threshold != null && (
                        <div className={styles.cardHint}>Потрібно ігор: {threshold}</div>
                      )}

                      <div className={styles.stars} aria-label={`rating ${rating} of 3`}>
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className={`${styles.star} ${i < rating ? styles.starOn : styles.starOff}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={styles.cardShine} aria-hidden />
                  </article>
                );
              })}
            </section>

            <div className={styles.bottom}>
              <Link className={styles.allBtn} href="/child/achievements/all">
                Усі досягнення
              </Link>

              {hasMore && (
                <div className={styles.moreNote}>
                  Ще {badges.length - MAX_ON_PAGE} у списку
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
