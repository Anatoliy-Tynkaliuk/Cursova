"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getChildBadges, getChildStats, type ChildBadgeItem, type ChildStats } from "@/lib/endpoints";
import { isLoggedIn } from "@/lib/auth";
import styles from "./page.module.css";

type ActivityDay = ChildStats["summary"]["activity14Days"][number];

function formatDayLabel(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return date.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit" });
}

function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const hrs = Math.floor(safeSeconds / 3600);
  const mins = Math.floor((safeSeconds % 3600) / 60);
  if (hrs > 0) return `${hrs} год ${mins} хв`;
  return `${mins} хв`;
}

export default function ChildStatsPage() {
  const params = useParams<{ childId: string }>();
  const childId = Number(params.childId);
  const [stats, setStats] = useState<ChildStats | null>(null);
  const [badges, setBadges] = useState<ChildBadgeItem[]>([]);
  const [finishedAttempts, setFinishedAttempts] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
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

        const latestPlayedDay = [...(data.summary.activity14Days ?? [])]
          .reverse()
          .find((day) => day.didPlay)?.date;
        setSelectedDay(latestPlayedDay ?? data.summary.activity14Days.at(-1)?.date ?? null);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Error");
      } finally {
        setLoading(false);
      }
    }

    load().catch((e: unknown) => setError(e instanceof Error ? e.message : "Error"));
  }, [childId]);

  const maxPossibleScore = useMemo(() => {
    if (!stats) return 0;
    return stats.summary.totalAttempts * 3;
  }, [stats]);

  const activityDays = useMemo(() => stats?.summary.activity14Days ?? [], [stats]);
  const selectedDayInfo = useMemo<ActivityDay | null>(() => {
    if (!selectedDay || activityDays.length === 0) return null;
    return activityDays.find((day) => day.date === selectedDay) ?? null;
  }, [activityDays, selectedDay]);

  const maxLevelsInDay = useMemo(
    () => Math.max(1, ...activityDays.map((day) => day.levelsPassed)),
    [activityDays],
  );

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
                  <span className={styles.summaryValue}>
                    {stats.summary.totalCorrect} з {stats.summary.totalQuestions}
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Бали</span>
                  <span className={styles.summaryValue}>
                    {stats.summary.totalScore} з {maxPossibleScore}
                  </span>
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
                  {badges.map((badge) => {
                    const bgSrc = badge.isEarned
                      ? "/Achievements_page/completed_achievements.png"
                      : "/Achievements_page/locked_achievements.png";

                    return (
                      <li
                        key={badge.id}
                        className={`${styles.badgeItem} ${badge.isEarned ? "" : styles.badgeLocked}`}
                      >
                        <div className={styles.badgeBg} aria-hidden="true">
                          <Image src={bgSrc} alt="" fill className={styles.badgeBgImg} />
                        </div>

                        <div className={styles.badgeContent}>
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
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className={styles.panel}>
              <h2 className={styles.sectionTitle}>Активність за 2 тижні</h2>
              <p className={styles.subInfo}>
                Зеленим підсвічені дні, коли дитина заходила в ігри. Наведи курсор або натисни на колонку.
              </p>

              {activityDays.length === 0 ? (
                <p className={styles.empty}>Поки що немає активності за останні 14 днів.</p>
              ) : (
                <>
                  <div className={styles.calendarGrid}>
                    {activityDays.map((day) => {
                      const height = day.didPlay
                        ? Math.max(36, Math.round((day.levelsPassed / maxLevelsInDay) * 96))
                        : 18;

                      return (
                        <button
                          key={day.date}
                          type="button"
                          onClick={() => setSelectedDay(day.date)}
                          className={`${styles.dayColumn} ${day.didPlay ? styles.dayActive : styles.dayInactive} ${selectedDay === day.date ? styles.daySelected : ""}`}
                          title={`${formatDayLabel(day.date)} • Рівнів пройдено: ${day.levelsPassed} • Час: ${formatDuration(day.durationSec)}`}
                          style={{ height }}
                          aria-label={`День ${formatDayLabel(day.date)}. Пройдено рівнів: ${day.levelsPassed}. Час у грі: ${formatDuration(day.durationSec)}`}
                        >
                          <span className={styles.dayDot} />
                        </button>
                      );
                    })}
                  </div>

                  <div className={styles.calendarLegend}>
                    {activityDays.map((day) => (
                      <span key={`label-${day.date}`} className={styles.dayLabel}>
                        {formatDayLabel(day.date)}
                      </span>
                    ))}
                  </div>

                  {selectedDayInfo && (
                    <div className={styles.dayDetails}>
                      <div className={styles.dayDetailsDate}>{formatDayLabel(selectedDayInfo.date)}</div>
                      <div>Пройдено рівнів: {selectedDayInfo.levelsPassed}</div>
                      <div>Час на сайті: {formatDuration(selectedDayInfo.durationSec)}</div>
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
