"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { joinByCode } from "@/lib/endpoints";
import { setChildSession } from "@/lib/auth";
import styles from "./JoinPage.module.css";

export default function JoinPage() {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onJoin() {
    const trimmed = code.trim();
    if (!trimmed || loading) return;

    setMsg("");
    setLoading(true);
    try {
      const data = await joinByCode(trimmed);
      setChildSession(data.childProfileId, data.ageGroupCode, data.childName);
      window.location.href = "/child/subjects";
    } catch (e: any) {
      setMsg(e?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* Background */}
      <div className={styles.bgWrap} aria-hidden="true">
        <Image
          src="/background.png"
          alt=""
          fill
          priority
          className={styles.bgImage}
        />
        <div className={styles.bgOverlay} />
      </div>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <div className={styles.brandTitle}>Kids Learning</div>
            <div className={styles.brandSub}>Parent Portal</div>
          </div>

          <div className={styles.headerActions}>
            <Link className={styles.headerBtn} href="/register">
              Реєстрація
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className={styles.main}>
        <section className={styles.card}>
          <h1 className={styles.title}>Вхід для дітей</h1>
          <p className={styles.subtitle}>
            Введи свій код, щоб увійти в свій акаунт.
          </p>

          <div className={styles.field}>
            <input
              className={styles.input}
              placeholder="Введи код"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onJoin();
              }}
              autoComplete="one-time-code"
              inputMode="text"
            />
          </div>

          <button
            className={styles.primaryBtn}
            onClick={onJoin}
            disabled={!code.trim() || loading}
          >
            {loading ? "Зачекай..." : "Увійти"}
          </button>

          <div className={styles.bottomActions}>
            <Link href="/" className={styles.outlineButton}>
              Назад на головну
            </Link>
          </div>

          {msg && <p className={styles.error}>{msg}</p>}
        </section>
      </main>
    </div>
  );
}
