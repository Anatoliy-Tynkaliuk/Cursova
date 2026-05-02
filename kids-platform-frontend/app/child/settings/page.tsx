/**
 * Огляд файлу: `kids-platform-frontend/app/child/settings/page.tsx`.
 * Призначення: містить частину логіки бекенду/фронтенду платформи навчальних ігор.
 * Взаємодія: імпортує типи, сервіси та компоненти з сусідніх модулів і передає дані через DTO/API props.
 * Терміни: API — контракт обміну даними; DTO — тип вхідних/вихідних даних; Service — бізнес-логіка; Controller/Page — точка входу запитів або UI-екран.
 */

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearChildSession, getChildSession } from "@/lib/auth";
import { getChildBadgesPublic } from "@/lib/endpoints";

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
