/**
 * 📘 ОГЛЯД ФАЙЛУ: `kids-platform-frontend/app/child/avatar-shop/page.tsx`.
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

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  buyAvatar,
  getAvatarShop,
  setActiveAvatar,
  type AvatarShopResponse,
} from "@/lib/endpoints";
import { getChildSession, setChildAvatar } from "@/lib/auth";
import styles from "./page.module.css";

const DEFAULT_AVATAR = "/avatars/astro-boy.png";

// Функція: normalizeAvatarSrc. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: normalizeAvatarSrc. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
function normalizeAvatarSrc(src: string | null | undefined) {
  if (!src || src === "undefined" || src === "null") return DEFAULT_AVATAR;
  if (
    src.startsWith("/") ||
    src.startsWith("http://") ||
    src.startsWith("https://")
  )
    return src;
  return DEFAULT_AVATAR;
}

// Функція: AvatarShopPage. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export default function AvatarShopPage() {
  const [childId, setChildId] = useState<number | null>(null);
  const [shop, setShop] = useState<AvatarShopResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getChildSession();
    if (!session.childProfileId) {
      window.location.href = "/child/join";
      return;
    }
    setChildId(session.childProfileId);
  }, []);

  useEffect(() => {
// Функція: load. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: load. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
    async function load() {
      if (!childId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getAvatarShop(childId);
        setShop(data);
        const active = data.avatars.find(
          (avatar) => avatar.id === data.activeAvatarId,
        );
        if (active) setChildAvatar(normalizeAvatarSrc(active.image));
      } catch (e: any) {
        setError(e.message ?? "Помилка");
      } finally {
        setLoading(false);
      }
    }

    load().catch((e: any) => setError(e.message ?? "Помилка"));
  }, [childId]);

  const purchasedSet = useMemo(
    () => new Set(shop?.purchasedAvatarIds ?? []),
    [shop],
  );

// Функція: onBuy. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: onBuy. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
  async function onBuy(avatarId: string) {
    if (!childId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await buyAvatar(childId, avatarId);
      setShop(data);
      const active = data.avatars.find(
        (avatar) => avatar.id === data.activeAvatarId,
      );
      if (active) setChildAvatar(normalizeAvatarSrc(active.image));
    } catch (e: any) {
      setError(e.message ?? "Помилка");
    } finally {
      setLoading(false);
    }
  }

// Функція: onSetActive. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: onSetActive. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
  async function onSetActive(avatarId: string) {
    if (!childId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await setActiveAvatar(childId, avatarId);
      setShop(data);
      const active = data.avatars.find(
        (avatar) => avatar.id === data.activeAvatarId,
      );
      if (active) setChildAvatar(normalizeAvatarSrc(active.image));
    } catch (e: any) {
      setError(e.message ?? "Помилка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <Image
        src="/background.png"
        alt="space background"
        fill
        priority
        className={styles.bgImg}
      />
      <div className={styles.overlay} />

      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.topBar}>
            <h1>Магазин аватарів</h1>
            <Link href="/child/subjects" className={styles.backBtn}>
              Назад
            </Link>
          </div>

          <div className={styles.stars}>
            <div className={styles.starItem}>
              <span className={styles.starLabel}>Доступно:</span>
              <b>{shop?.stars.available ?? 0}</b>
              <Image
                src="/star.png"
                alt="Зірка"
                width={29}
                height={29}
                className={styles.starIcon}
              />
            </div>
            <div className={styles.starItem}>
              <span className={styles.starLabel}>Зароблено:</span>
              <b>{shop?.stars.earned ?? 0}</b>
              <Image
                src="/star.png"
                alt="Зірка"
                width={29}
                height={29}
                className={styles.starIcon}
              />
            </div>
            <div className={styles.starItem}>
              <span className={styles.starLabel}>Витрачено:</span>
              <b>{shop?.stars.spent ?? 0}</b>
              <Image
                src="/star.png"
                alt="Зірка"
                width={29}
                height={29}
                className={styles.starIcon}
              />
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {loading && !shop && <p>Завантаження...</p>}

          <section className={styles.grid}>
            {shop?.avatars.map((avatar) => {
              const isPurchased = purchasedSet.has(avatar.id);
              const isActive = shop.activeAvatarId === avatar.id;
// Функція: canBuy. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: canBuy. Локальний обробник подій/даних, який викликається з цього файлу або з JSX.
              const canBuy = (shop.stars.available ?? 0) >= avatar.price;

              return (
                <article key={avatar.id} className={styles.avatarCard}>
                    <Image
                      src={normalizeAvatarSrc(avatar.image)}
                      alt={avatar.name}
                      width={86}
                      height={86}
                      className={styles.avatarImage}
                    />
                  <h3>{avatar.name}</h3>
                  <p className={styles.price}>
                    Ціна: {avatar.price}
                    <Image
                      src="/star.png"
                      alt="Зірка"
                      width={29}
                      height={29}
                      className={styles.priceStar}
                    />
                  </p>

                  {isActive ? (
                    <button disabled className={styles.activeBtn}>
                      Обрано
                    </button>
                  ) : isPurchased ? (
                    <button
                      disabled={loading}
                      onClick={() => onSetActive(avatar.id)}
                      className={styles.actionBtn}
                    >
                      Обрати
                    </button>
                  ) : (
                    <button
                      disabled={loading || !canBuy}
                      onClick={() => onBuy(avatar.id)}
                      className={styles.actionBtn}
                      title={!canBuy ? "Недостатньо зірочок" : "Купити"}
                    >
                      Купити
                    </button>
                  )}
                </article>
              );
            })}
          </section>
        </div>
      </div>
    </main>
  );
}
