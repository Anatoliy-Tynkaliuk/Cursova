/**
 * 📘 ОГЛЯД ФАЙЛУ: `kids-platform-frontend/app/child/page.tsx`.
 * ЩО ЦЕ: цей файл — частина навчальної платформи для дітей (бекенд API або фронтенд-екран).
 * НАВІЩО: реалізує конкретний шмат логіки (дані, перевірки, маршрути, або відображення інтерфейсу).
 * ЯК ПРАЦЮЄ: імпортує залежності, приймає вхідні дані, обробляє їх, та повертає результат/HTML/API-відповідь.
 * ВЗАЄМОДІЯ З ІНШИМИ ФАЙЛАМИ: через import/export, виклики сервісів, DTO, props, HTTP-запити.
 * ГЛОСАРІЙ:
 * - API: правила обміну даними між клієнтом (фронтенд) і сервером (бекенд).
 * - DTO: структура даних, яку дозволено приймати/повертати.
 * - Service: шар бізнес-логіки (обчислення, перевірки, робота з БД).
 * - Controller/Page: точка входу запиту користувача або сторінка інтерфейсу.
 * - Component: перевикористовуваний UI-блок.
 * - Prisma/ORM: інструмент доступу до бази даних через код.
 */


"use client";

import { useEffect, useState } from "react";
import { getChildBadgesPublic, getGames, type ChildBadgeItem, GameListItem } from "@/lib/endpoints";
import Link from "next/link";
import { getChildSession, clearChildSession } from "@/lib/auth";

// Функція: ChildHomePage. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export default function ChildHomePage() {
  const [ageGroupCode, setAgeGroupCode] = useState<string | null>(null);
  const [childProfileId, setChildProfileId] = useState<number | null>(null);
  const [games, setGames] = useState<GameListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [badges, setBadges] = useState<ChildBadgeItem[]>([]);
  const [finishedAttempts, setFinishedAttempts] = useState(0);
  const [totalStars, setTotalStars] = useState(0);

// Функція: parseThreshold. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: parseThreshold. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
  function parseThreshold(code: string) {
    const match = code.match(/^FINISHED_(\d+)$/i);
    if (!match) return null;
    const value = Number(match[1]);
    return Number.isFinite(value) ? value : null;
  }

  useEffect(() => {
    const session = getChildSession();
    if (!session.childProfileId || !session.ageGroupCode) {
      window.location.href = "/child/join";
      return;
    }
    setChildProfileId(session.childProfileId);
    setAgeGroupCode(session.ageGroupCode);
  }, []);

  useEffect(() => {
// Функція: loadBadges. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: loadBadges. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
    async function loadBadges(id: number) {
      try {
        const data = await getChildBadgesPublic(id);
        setBadges(data.badges);
        setFinishedAttempts(data.finishedAttempts);
        setTotalStars(data.totalStars ?? data.finishedAttempts);
      } catch (e: any) {
        setError(e.message ?? "Error");
      }
    }

    if (childProfileId) {
      loadBadges(childProfileId);
    }
  }, [childProfileId]);

// Функція: load. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: load. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
  async function load(code: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await getGames(code);
      setGames(data);
    } catch (e: any) {
      setError(e.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (ageGroupCode) {
      load(ageGroupCode);
    }
  }, [ageGroupCode]);

// Функція: onStart. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: onStart. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
  function onStart(gameId: number) {
    if (!childProfileId) return;
    window.location.href = `/child/game/${gameId}`;
  }

// Функція: onExit. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: onExit. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
  function onExit() {
    clearChildSession();
    window.location.href = "/child/join";
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Вибір гри</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <button onClick={onExit}>Вийти</button>
        <button onClick={() => ageGroupCode && load(ageGroupCode)} disabled={loading || !ageGroupCode}>
          {loading ? "Завантажую..." : "Оновити"}
        </button>
        <Link href="/child/subjects">До меню планет</Link>
        <Link href="/">На головну</Link>
      </div>

      <section style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Досягнення</h2>
        <p style={{ fontSize: 12, opacity: 0.8, marginTop: 0 }}>
          Завершено ігор: {finishedAttempts}
        | Зірочок: {totalStars}
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

      {error && <p style={{ color: "red" }}>{error}</p>}

      {games.length === 0 ? (
        <p>Нема ігор для цієї вікової групи.</p>
      ) : (
        <ul style={{ display: "grid", gap: 10, listStyle: "none", padding: 0 }}>
          {games.map((g) => (
            <li key={g.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
              <div style={{ fontWeight: 600 }}>{g.title}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                module: {g.moduleCode} | diff: {g.difficulty}
              </div>
              <button style={{ marginTop: 8 }} onClick={() => onStart(g.id)}>
                Почати
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
