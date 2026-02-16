"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getChildBadgesPublic, type ChildBadgeItem } from "@/lib/endpoints";
import { getChildSession } from "@/lib/auth";

export default function ChildAchievementsPage() {
  const [badges, setBadges] = useState<ChildBadgeItem[]>([]);
  const [finishedAttempts, setFinishedAttempts] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function parseThreshold(code: string) {
    const match = code.match(/^FINISHED_(\d+)$/i);
    if (!match) return null;
    const value = Number(match[1]);
    return Number.isFinite(value) ? value : null;
  }

  useEffect(() => {
    const session = getChildSession();
    if (!session.childProfileId) {
      window.location.href = "/child/join";
      return;
    }

    async function load() {
      setError(null);
      try {
        const data = await getChildBadgesPublic(session.childProfileId!);
        setBadges(data.badges);
        setFinishedAttempts(data.finishedAttempts);
        setTotalStars(data.totalStars ?? 0);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Error");
      }
    }

    load().catch((e: unknown) => setError(e instanceof Error ? e.message : "Error"));
  }, []);

  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Досягнення</h1>
        <Link href="/child/subjects">← Назад до меню</Link>
      </header>

      <p style={{ fontSize: 12, opacity: 0.8 }}>
        Завершено ігор: {finishedAttempts} | Зірочок: {totalStars}
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {badges.length === 0 ? (
        <p>Поки що немає досягнень.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
          {badges.map((badge) => (
            <li
              key={badge.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 12,
                opacity: badge.isEarned ? 1 : 0.5,
              }}
            >
              <div style={{ fontWeight: 700 }}>{badge.icon ? `${badge.icon} ` : ""}{badge.title}</div>
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
    </div>
  );
}
