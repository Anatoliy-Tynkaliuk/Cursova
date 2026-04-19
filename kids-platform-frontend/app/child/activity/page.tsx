"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getChildActivityPublic, type ChildActivityReport } from "@/lib/endpoints";
import { getChildSession } from "@/lib/auth";

function formatDuration(totalSec: number) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}г ${m}хв`;
  if (m > 0) return `${m}хв ${s}с`;
  return `${s}с`;
}

function monthKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default function ChildActivityPage() {
  const [report, setReport] = useState<ChildActivityReport | null>(null);
  const [month, setMonth] = useState(monthKey());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getChildSession();
    if (!session.childProfileId) {
      window.location.href = "/child/join";
      return;
    }

    getChildActivityPublic(session.childProfileId, month)
      .then(setReport)
      .catch((e: any) => setError(e.message ?? "Error"));
  }, [month]);

  const days = report?.calendar.days ?? [];

  const firstDayOffset = useMemo(() => {
    if (days.length === 0) return 0;
    const dt = new Date(`${days[0].date}T00:00:00Z`);
    return (dt.getUTCDay() + 6) % 7;
  }, [days]);

  return (
    <div style={{ padding: 16, maxWidth: 1000 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Активність дитини</h1>
        <Link href="/child/subjects">← Назад</Link>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginTop: 12 }}>
        <label>
          Місяць: <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </label>
      </div>

      {report && (
        <>
          <section style={{ marginTop: 12, border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
            <h2 style={{ marginTop: 0 }}>Середній час перебування</h2>
            <div>Тиждень: {formatDuration(report.summary.week.avgDurationSec)} (спроб: {report.summary.week.attempts})</div>
            <div>Місяць: {formatDuration(report.summary.month.avgDurationSec)} (спроб: {report.summary.month.attempts})</div>
            <div>Рік: {formatDuration(report.summary.year.avgDurationSec)} (спроб: {report.summary.year.attempts})</div>
          </section>

          <section style={{ marginTop: 12, border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
            <h2 style={{ marginTop: 0 }}>Календар активності</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                gap: 6,
                alignItems: "stretch",
              }}
            >
              {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"].map((d) => (
                <div key={d} style={{ fontWeight: 700, textAlign: "center" }}>{d}</div>
              ))}

              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {days.map((day) => (
                <div
                  key={day.date}
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: 8,
                    padding: 8,
                    minHeight: 90,
                    background: day.played ? "#e8f7ff" : "#fafafa",
                  }}
                  title={`Спроб: ${day.attempts}\nПройдено рівнів: ${day.finishedLevels}\nЧас: ${formatDuration(day.totalDurationSec)}\nПредмети: ${day.modules.join(", ") || "—"}`}
                >
                  <div style={{ fontWeight: 700 }}>{Number(day.date.slice(-2))}</div>
                  {day.played && (
                    <div style={{ fontSize: 11 }}>
                      <div>Рівні: {day.finishedLevels}</div>
                      <div>{day.modules.join(", ") || "—"}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
