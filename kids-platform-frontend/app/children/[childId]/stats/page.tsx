"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getChildBadges, getChildStats, type ChildBadgeItem, type ChildStats } from "@/lib/endpoints";
import { isLoggedIn } from "@/lib/auth";
import styles from "./page.module.css";

type ActivityDay = {
  date: string;
  didPlay: boolean;
  levelsPassed: number;
  durationSec: number;
};

function toMonthKey(isoDate: string) {
  return isoDate.slice(0, 7);
}

function formatDayLabel(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return date.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit" });
}

function formatMonthLabel(monthKey: string) {
  const date = new Date(`${monthKey}-01T00:00:00Z`);
  return date.toLocaleDateString("uk-UA", { month: "long", year: "numeric" });
}

function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const hrs = Math.floor(safeSeconds / 3600);
  const mins = Math.floor((safeSeconds % 3600) / 60);
  if (hrs > 0) return `${hrs} год ${mins} хв`;
  return `${mins} хв`;
}

function normalizeActivityDays(stats: ChildStats): ActivityDay[] {
  const rawYear = stats.summary.activityYearDays ?? [];
  const raw14 = stats.summary.activity14Days ?? [];

  if (rawYear.length > 0) return rawYear;
  if (raw14.length > 0) return raw14;

  const byDate = new Map<string, ActivityDay>();
  for (const attempt of stats.attempts ?? []) {
    const dateKey = String(attempt.createdAt).slice(0, 10);
    const prev = byDate.get(dateKey) ?? { date: dateKey, didPlay: false, levelsPassed: 0, durationSec: 0 };
    prev.didPlay = true;
    prev.durationSec += Math.max(0, attempt.durationSec ?? 0);
    if (attempt.isFinished && attempt.correctCount > 0) prev.levelsPassed += 1;
    byDate.set(dateKey, prev);
  }

  const todayUtc = new Date();
  todayUtc.setUTCHours(0, 0, 0, 0);
  const startUtc = new Date(todayUtc);
  startUtc.setUTCDate(startUtc.getUTCDate() - 364);

  return Array.from({ length: 365 }, (_, idx) => {
    const day = new Date(startUtc);
    day.setUTCDate(startUtc.getUTCDate() + idx);
    const key = day.toISOString().slice(0, 10);
    return byDate.get(key) ?? { date: key, didPlay: false, levelsPassed: 0, durationSec: 0 };
  });
}

export default function ChildStatsPage() {
  const params = useParams<{ childId: string }>();
  const childId = Number(params.childId);
  const [stats, setStats] = useState<ChildStats | null>(null);
  const [badges, setBadges] = useState<ChildBadgeItem[]>([]);
  const [finishedAttempts, setFinishedAttempts] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
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

        const normalizedDays = normalizeActivityDays(data);
        const availableMonths = [...new Set(normalizedDays.map((d) => toMonthKey(d.date)))];
        const lastMonth = availableMonths.at(-1) ?? null;
        setSelectedMonth(lastMonth);

        const latestPlayedDay = [...normalizedDays].reverse().find((day) => day.didPlay)?.date;
        setSelectedDay(latestPlayedDay ?? normalizedDays.at(-1)?.date ?? null);
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

  const activityDays = useMemo(() => (stats ? normalizeActivityDays(stats) : []), [stats]);
  const monthKeys = useMemo(() => [...new Set(activityDays.map((day) => toMonthKey(day.date)))], [activityDays]);

  const selectedMonthIndex = selectedMonth ? monthKeys.indexOf(selectedMonth) : -1;
  const prevMonthKey = selectedMonthIndex > 0 ? monthKeys[selectedMonthIndex - 1] : null;
  const nextMonthKey = selectedMonthIndex >= 0 && selectedMonthIndex < monthKeys.length - 1 ? monthKeys[selectedMonthIndex + 1] : null;

  const monthDays = useMemo(() => {
    if (!selectedMonth) return [] as ActivityDay[];
    return activityDays.filter((day) => toMonthKey(day.date) === selectedMonth);
  }, [activityDays, selectedMonth]);

  const selectedDayInfo = useMemo<ActivityDay | null>(() => {
    if (!selectedDay || monthDays.length === 0) return null;
    return monthDays.find((day) => day.date === selectedDay) ?? null;
  }, [monthDays, selectedDay]);

  const monthTotals = useMemo(() => {
    return monthDays.reduce(
      (acc, day) => {
        acc.levelsPassed += day.levelsPassed;
        acc.durationSec += day.durationSec;
        return acc;
      },
      { levelsPassed: 0, durationSec: 0 },
    );
  }, [monthDays]);

  const maxLevelsInMonthDay = useMemo(
    () => Math.max(1, ...monthDays.map((day) => day.levelsPassed)),
    [monthDays],
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
              <h2 className={styles.sectionTitle}>Календар активності (1 рік)</h2>
              <p className={styles.subInfo}>Активні дні підсвічені зеленим. Можна переглядати різні місяці.</p>

              {!selectedMonth ? (
                <p className={styles.empty}>Не вдалося підготувати календар активності.</p>
              ) : (
                <>
                  <div className={styles.monthNav}>
                    <button
                      type="button"
                      className={styles.monthBtn}
                      onClick={() => prevMonthKey && setSelectedMonth(prevMonthKey)}
                      disabled={!prevMonthKey}
                    >
                      ← Попередній
                    </button>
                    <div className={styles.monthTitle}>{formatMonthLabel(selectedMonth)}</div>
                    <button
                      type="button"
                      className={styles.monthBtn}
                      onClick={() => nextMonthKey && setSelectedMonth(nextMonthKey)}
                      disabled={!nextMonthKey}
                    >
                      Наступний →
                    </button>
                  </div>

                  <div className={styles.monthSummary}>
                    <div>Пройдено рівнів за місяць: {monthTotals.levelsPassed}</div>
                    <div>Час активності за місяць: {formatDuration(monthTotals.durationSec)}</div>
                  </div>

                  <div className={styles.calendarGrid} style={{ gridTemplateColumns: `repeat(${monthDays.length}, minmax(0, 1fr))` }}>
                    {monthDays.map((day) => {
                      const height = day.didPlay
                        ? Math.max(30, Math.round((day.levelsPassed / maxLevelsInMonthDay) * 98))
                        : 16;

                      return (
                        <button
                          key={day.date}
                          type="button"
                          onClick={() => setSelectedDay(day.date)}
                          className={`${styles.dayColumn} ${day.didPlay ? styles.dayActive : styles.dayInactive} ${selectedDay === day.date ? styles.daySelected : ""}`}
                          title={`${formatDayLabel(day.date)} • Рівнів: ${day.levelsPassed} • Час: ${formatDuration(day.durationSec)}`}
                          style={{ height }}
                          aria-label={`День ${formatDayLabel(day.date)}. Рівнів ${day.levelsPassed}. Час ${formatDuration(day.durationSec)}`}
                        >
                          <span className={styles.dayDot} />
                        </button>
                      );
                    })}
                  </div>

                  <div className={styles.calendarLegend} style={{ gridTemplateColumns: `repeat(${monthDays.length}, minmax(0, 1fr))` }}>
                    {monthDays.map((day) => (
                      <span key={`label-${day.date}`} className={styles.dayLabel}>
                        {new Date(`${day.date}T00:00:00Z`).getUTCDate()}
                      </span>
                    ))}
                  </div>

                  {selectedDayInfo && (
                    <div className={styles.dayDetails}>
                      <div className={styles.dayDetailsDate}>{formatDayLabel(selectedDayInfo.date)}</div>
                      <div>Пройдено рівнів: {selectedDayInfo.levelsPassed}</div>
                      <div>Час активності: {formatDuration(selectedDayInfo.durationSec)}</div>
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
