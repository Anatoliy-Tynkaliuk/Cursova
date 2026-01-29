"use client";

import { useState, type FormEvent } from "react";
import styles from "./LoginPage.module.css";
import { login } from "@/lib/endpoints";
import { setToken } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const data = await login(email, password);
      setToken(data.accessToken);
      window.location.href = data.user.role === "admin" ? "/admin" : "/parent";
    } catch (e: any) {
      setErr(e.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.bg} />
      <div className={styles.overlay} />

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <div className={styles.brandTitle}>Kids Learning</div>
            <div className={styles.brandSub}>Parent Portal</div>
          </div>

          <nav className={styles.nav}>
            <a className={styles.navLink} href="/register">
              Реєстрація
            </a>
            <a className={styles.navLink} href="/child/join">
              Вхід дитини
            </a>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>Вхід для батьків</h1>
          <p className={styles.subTitle}>Увійди, щоб керувати профілями дітей.</p>

          <form onSubmit={onSubmit} className={styles.form}>
            <label className={styles.label}>
              Email
              <input
                className={styles.input}
                placeholder="name@gmail.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>

            <label className={styles.label}>
              Пароль
              <div className={styles.passwordWrap}>
                <input
                  className={styles.input}
                  placeholder="••••••••"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className={styles.togglePass}
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  title={showPass ? "Сховати пароль" : "Показати пароль"}
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </label>

            {err && <div className={styles.err}>{err}</div>}

            <button className={styles.primaryBtn} type="submit" disabled={loading}>
              {loading ? "Вхід..." : "Увійти"}
            </button>
          </form>

          <div className={styles.links}>
            <div className={styles.linkRow}>
              Немає акаунта?{" "}
              <a className={styles.link} href="/register">
                Зареєструватися
              </a>
            </div>
            <div className={styles.linkRow}>
              Вхід для дитини?{" "}
              <a className={styles.link} href="/child/join">
                Ввести код
              </a>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>© {new Date().getFullYear()} Kids Learning</div>
      </footer>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M1.5 12s4-7.5 10.5-7.5S22.5 12 22.5 12s-4 7.5-10.5 7.5S1.5 12 1.5 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M10.6 10.6A3.5 3.5 0 0 0 13.4 13.4"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M1.5 12s2.8-5.2 7.6-6.9M22.5 12s-2.8 5.2-7.6 6.9"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}
