/**
 * 📘 ОГЛЯД ФАЙЛУ: `kids-platform-frontend/app/child/settings/page.tsx`.
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

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearChildSession, getChildSession } from "@/lib/auth";
import { getChildBadgesPublic } from "@/lib/endpoints";

// Функція: ChildSettingsPage. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export default function ChildSettingsPage() {
  const [childName, setChildName] = useState("Друже");
  const [finishedAttempts, setFinishedAttempts] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getChildSession();
    if (!session.childProfileId) {
      window.location.href = "/child/join";
      return;
    }
    setChildName(session.childName || "Друже");

// Функція: load. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: load. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
    async function load() {
      setError(null);
      try {
        const data = await getChildBadgesPublic(session.childProfileId!);
        setFinishedAttempts(data.finishedAttempts);
        setTotalStars(data.totalStars ?? data.finishedAttempts);
      } catch (e: any) {
        setError(e.message ?? "Error");
      }
    }

    load().catch((e: any) => setError(e.message ?? "Error"));
  }, []);

// Функція: onExit. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: onExit. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
  function onExit() {
    clearChildSession();
    window.location.href = "/child/join";
  }

  return (
    <div style={{ padding: 16, maxWidth: 700 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Налаштування</h1>
        <Link href="/child/subjects">← Назад до меню</Link>
      </header>

      <p>Привіт, {childName}! Тут можна завершити сесію дитини.</p>
      <p style={{ fontSize: 12, opacity: 0.8 }}>Завершено ігор: {finishedAttempts}
        | Зірочок: {totalStars}</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={onExit} style={{ marginTop: 12 }}>
        Вийти з профілю дитини
      </button>
    </div>
  );
}
