"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getChildBadges, getChildStats, type ChildBadgeItem, type ChildStats } from "@/lib/endpoints";
import { isLoggedIn } from "@/lib/auth";

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
      } catch (e: any) {
        setError(e.message ?? "Error");
      } finally {
        setLoading(false);
      }
    }

    load().catch((e: any) => setError(e.message ?? "Error"));
  }, [childId]);

  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <h1>Статистика дитини</h1>
      <div style={{ marginBottom: 12 }}>
        <Link href="/parent">← Назад до кабінету</Link>
      </div>

      {loading && <p>Завантаження...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {stats && (
        <>
          <div style={{ border: "1px solid #333", borderRadius: 10, padding: 12, marginBottom: 16 }}>
            <div style={{ fontWeight: 700 }}>{stats.child.name}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Вік: {stats.child.ageGroupCode}</div>
            <div style={{ marginTop: 8 }}>
              <div>Спроб: {stats.summary.totalAttempts}</div>
              <div>Завершено: {stats.summary.finishedAttempts}</div>
              <div>Правильні відповіді: {stats.summary.totalCorrect}</div>
              <div>Запитань: {stats.summary.totalQuestions}</div>
              <div>Бали: {stats.summary.totalScore}</div>
            </div>
          </div>

          <section style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12, marginBottom: 16 }}>
            <h2 style={{ marginTop: 0 }}>Досягнення</h2>
            <p style={{ fontSize: 12, opacity: 0.8, marginTop: 0 }}>
              Завершено ігор: {finishedAttempts}
            </p>
            {badges.length === 0 ? (
              <p>Поки що немає досягнень.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
                {badges.map((badge) => (
                  <li
                    key={badge.id}
                    style={{
                      border: "1px solid #ccc",
                      borderRadius: 8,
                      padding: 10,
                      opacity: badge.isEarned ? 1 : 0.5,
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>
                      {badge.icon ? `${badge.icon} ` : ""}{badge.title}
                    </div>
                    {badge.description && <div style={{ fontSize: 12 }}>{badge.description}</div>}
                    {parseThreshold(badge.code) != null && (
                      <div style={{ fontSize: 12, opacity: 0.8 }}>
                        Потрібно завершених ігор: {parseThreshold(badge.code)}
                      </div>
                    )}
                    <div style={{ fontSize: 12, marginTop: 4 }}>
                      {badge.isEarned ? "Отримано ✅" : "Ще не отримано"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <h2>Останні ігри</h2>
          {stats.attempts.length === 0 ? (
            <p>Ще немає спроб.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
              {stats.attempts.map((attempt) => (
                <li key={attempt.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
                  <div style={{ fontWeight: 600 }}>{attempt.game.title}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    module: {attempt.game.moduleCode}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    Результат: {attempt.correctCount}/{attempt.totalCount} | Бали: {attempt.score}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    {attempt.isFinished ? "Завершено" : "У процесі"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
