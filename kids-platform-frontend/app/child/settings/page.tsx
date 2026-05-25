"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearChildSession, getChildSession } from "@/lib/auth";
import { useRequireChildSession } from "@/lib/hooks/useRequireChildSession";
import { getChildBadgesPublic } from "@/lib/endpoints";

export default function ChildSettingsPage() {
  const router = useRouter();
  useRequireChildSession();
  const [childName, setChildName] = useState("Друже");
  const [finishedAttempts, setFinishedAttempts] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getChildSession();
    if (!session.childProfileId) {
      router.push("/child/join");
      return;
    }
    setChildName(session.childName || "Друже");

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

  function onExit() {
    clearChildSession();
    router.push("/child/join");
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
