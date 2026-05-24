"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearChildSession, getChildSession } from "@/lib/auth";
import { useChildGames } from "./hooks/useChildGames";
import { useChildBadges } from "./hooks/useChildBadges";
import { BadgeCard } from "./components/BadgeCard";
import styles from "./child.module.css";

export default function ChildHomePage() {
  const [ageGroupCode, setAgeGroupCode] = useState<string | null>(null);
  const [childProfileId, setChildProfileId] = useState<number | null>(null);

  useEffect(() => {
    const session = getChildSession();
    if (!session.childProfileId || !session.ageGroupCode) {
      window.location.href = "/child/join";
      return;
    }
    setChildProfileId(session.childProfileId);
    setAgeGroupCode(session.ageGroupCode);
  }, []);

  const { badges, finishedAttempts, totalStars, error: badgeError } = useChildBadges(childProfileId);
  const { games, loading, error: gamesError, reload } = useChildGames(ageGroupCode);
  const error = badgeError ?? gamesError;

  function onExit() {
    clearChildSession();
    window.location.href = "/child/join";
  }

  return (
    <div className={styles.page}>
      <h1>Вибір гри</h1>
      <div className={styles.toolbar}>
        <button onClick={onExit}>Вийти</button>
        <button onClick={() => void reload()} disabled={loading || !ageGroupCode}>{loading ? "Завантажую..." : "Оновити"}</button>
        <Link href="/child/subjects">До меню планет</Link>
        <Link href="/">На головну</Link>
      </div>

      <section className={styles.section}>
        <h2>Досягнення</h2>
        <p className={styles.summary}>Завершено ігор: {finishedAttempts} | Зірочок: {totalStars}</p>
        {badges.length === 0 ? <p>Поки що немає досягнень.</p> : <ul className={styles.badgesList}>{badges.map((badge) => <BadgeCard key={badge.id} badge={badge} />)}</ul>}
      </section>

      {error && <p className={styles.error}>{error}</p>}
      {games.length === 0 ? <p>Нема ігор для цієї вікової групи.</p> : (
        <ul className={styles.gamesList}>
          {games.map((g) => (
            <li key={g.id} className={styles.gameCard}>
              <div><strong>{g.title}</strong></div>
              <div>module: {g.moduleCode} | diff: {g.difficulty}</div>
              <button style={{ marginTop: 8 }} onClick={() => (window.location.href = `/child/game/${g.id}`)}>Почати</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
