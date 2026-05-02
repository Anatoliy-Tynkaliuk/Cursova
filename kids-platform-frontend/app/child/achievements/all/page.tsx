/**
 * 📘 ОГЛЯД ФАЙЛУ: `kids-platform-frontend/app/child/achievements/all/page.tsx`.
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
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { getChildBadgesPublic, type ChildBadgeItem } from "@/lib/endpoints";
import { getChildSession } from "@/lib/auth";
import styles from "./AllAchievementsPage.module.css";

// Функція: parseThreshold. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: parseThreshold. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
function parseThreshold(code: string) {
  const match = code.match(/^FINISHED_(\d+)$/i);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

// Функція: clamp. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: clamp. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

// Функція: AllAchievementsPage. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export default function AllAchievementsPage() {
  const [badges, setBadges] = useState<ChildBadgeItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const session = useMemo(() => getChildSession(), []);

  useEffect(() => {
    if (!session?.childProfileId) {
      window.location.href = "/child/join";
      return;
    }

// Функція: load. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: load. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
    async function load() {
      setError(null);
      try {
        const data = await getChildBadgesPublic(session.childProfileId!);
        setBadges(data.badges ?? []);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Error");
      }
    }

    load().catch((e: unknown) => setError(e instanceof Error ? e.message : "Error"));
  }, [session?.childProfileId, session]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <Link className={styles.back} href="/child/achievements">
            ← Назад
          </Link>
          <h1 className={styles.title}>Усі досягнення</h1>
          <div className={styles.spacer} />
        </header>

        {error && <div className={styles.error}>{error}</div>}

        {badges.length === 0 ? (
          <div className={styles.empty}>Поки що немає досягнень.</div>
        ) : (
          <section className={styles.grid}>
            {badges.map((b) => {
              const locked = !b.isEarned;
              const rating = clamp((b as any).rating ?? (b.isEarned ? 3 : 0), 0, 3);
              const threshold = parseThreshold(b.code);

              return (
                <article
                  key={b.id}
                  className={`${styles.card} ${locked ? styles.cardLocked : ""}`}
                >
                  <div className={styles.icon}>
                    {locked ? (
                      <div className={styles.lock} aria-hidden />
                    ) : (
                      <Image
                        src={(b as any).imageUrl || "/achievements/badge-default.png"}
                        alt=""
                        width={88}
                        height={88}
                        className={styles.badgeImg}
                      />
                    )}
                  </div>

                  <div className={styles.content}>
                    <div className={styles.cardTitle}>{b.title}</div>
                    {b.description && <div className={styles.desc}>{b.description}</div>}
                    {threshold != null && <div className={styles.hint}>Потрібно ігор: {threshold}</div>}

                    <div className={styles.stars}>
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className={`${styles.star} ${i < rating ? styles.starOn : styles.starOff}`}
                        >
                          ★
                        </span>
                      ))}
                      <span className={styles.status}>{b.isEarned ? "Отримано ✅" : "Ще не отримано"}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}
