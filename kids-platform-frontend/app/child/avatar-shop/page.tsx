"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { buyAvatar, getAvatarShop, setActiveAvatar, type AvatarShopResponse } from "@/lib/endpoints";
import { getChildSession, setChildAvatar } from "@/lib/auth";
import styles from "./page.module.css";

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
    async function load() {
      if (!childId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getAvatarShop(childId);
        setShop(data);
        const active = data.avatars.find((avatar) => avatar.id === data.activeAvatarId);
        if (active) setChildAvatar(active.icon);
      } catch (e: any) {
        setError(e.message ?? "Помилка");
      } finally {
        setLoading(false);
      }
    }

    load().catch((e: any) => setError(e.message ?? "Помилка"));
  }, [childId]);

  const purchasedSet = useMemo(() => new Set(shop?.purchasedAvatarIds ?? []), [shop]);

  async function onBuy(avatarId: string) {
    if (!childId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await buyAvatar(childId, avatarId);
      setShop(data);
      const active = data.avatars.find((avatar) => avatar.id === data.activeAvatarId);
      if (active) setChildAvatar(active.icon);
    } catch (e: any) {
      setError(e.message ?? "Помилка");
    } finally {
      setLoading(false);
    }
  }

  async function onSetActive(avatarId: string) {
    if (!childId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await setActiveAvatar(childId, avatarId);
      setShop(data);
      const active = data.avatars.find((avatar) => avatar.id === data.activeAvatarId);
      if (active) setChildAvatar(active.icon);
    } catch (e: any) {
      setError(e.message ?? "Помилка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.topBar}>
          <h1>Магазин аватарів</h1>
          <Link href="/child/subjects" className={styles.backBtn}>Назад до меню</Link>
        </div>

        <p className={styles.stars}>
          ⭐ Доступно: <b>{shop?.stars.available ?? 0}</b> | Зароблено: {shop?.stars.earned ?? 0} | Витрачено: {shop?.stars.spent ?? 0}
        </p>

        {error && <p className={styles.error}>{error}</p>}
        {loading && !shop && <p>Завантаження...</p>}

        <section className={styles.grid}>
          {shop?.avatars.map((avatar) => {
            const isPurchased = purchasedSet.has(avatar.id);
            const isActive = shop.activeAvatarId === avatar.id;
            const canBuy = (shop.stars.available ?? 0) >= avatar.price;

            return (
              <article key={avatar.id} className={styles.avatarCard}>
                <div className={styles.avatarIcon}>{avatar.icon}</div>
                <h3>{avatar.name}</h3>
                <p className={styles.price}>Ціна: ⭐ {avatar.price}</p>

                {isActive ? (
                  <button disabled className={styles.activeBtn}>Обрано</button>
                ) : isPurchased ? (
                  <button disabled={loading} onClick={() => onSetActive(avatar.id)} className={styles.actionBtn}>
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
    </main>
  );
}
