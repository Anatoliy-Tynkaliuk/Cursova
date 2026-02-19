"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, type FormEvent } from "react";
import styles from "./RegisterPage.module.css";
import { setToken } from "@/lib/auth";
import { register } from "@/lib/endpoints";

type FieldErrors = {
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [serverErr, setServerErr] = useState("");
  const [fieldErrs, setFieldErrs] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);

  const computed = useMemo(() => {
    const e = email.trim();
    const u = username.trim();
    const p = password;
    const c = confirmPassword;

    const next: FieldErrors = {};

    if (!e) next.email = "Введіть електронну адресу";
    else if (!isValidEmail(e)) next.email = "Неправильна електронна адреса";

    if (!u) next.username = "Введіть username";
    else if (u.length < 3) next.username = "Username замалий (мінімум 3 символи)";
    else if (u.length > 24) next.username = "Username задовгий (максимум 24 символи)";

    if (!p) next.password = "Введіть пароль";
    else if (p.length < 6) next.password = "Замалий пароль (мінімум 6 символів)";

    if (!c) next.confirmPassword = "Повторіть пароль";
    else if (p && c !== p) next.confirmPassword = "Паролі не співпадають";

    const hasAnyError = Object.keys(next).length > 0;
    const canGlow = !hasAnyError && !loading;

    return { nextErrors: next, hasAnyError, canGlow };
  }, [email, username, password, confirmPassword, loading]);

  function validateAndSetErrors(): boolean {
    setFieldErrs(computed.nextErrors);
    return !computed.hasAnyError;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmittedOnce(true);
    setServerErr("");

    const ok = validateAndSetErrors();
    if (!ok) {
      setFieldErrs((prev) => ({
        ...prev,
        form: "Ви неправильно ввели дані.Повторіть спробу",
      }));
      return;
    }

    setLoading(true);
    try {
      const data = await register(email.trim(), username.trim(), password);
      setToken(data.accessToken);
      window.location.href = data.user.role === "admin" ? "/admin" : "/parent";
    } catch (e: any) {
      setServerErr(e?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  function touchValidate() {
    if (!submittedOnce) return;
    setFieldErrs(computed.nextErrors);
  }

  return (
    <div className={styles.page}>
      <div className={styles.bgWrap} aria-hidden="true">
        <Image
          src="/background.png"
          alt=""
          fill
          priority
          className={styles.bgImage}
        />
      </div>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <div className={styles.brandTitle}>Kids Learning</div>
            <div className={styles.brandSub}>Parent Portal</div>
          </div>

          <nav className={styles.nav}>
            <Link className={styles.navLink} href="/login">
              Назад
            </Link>
            <Link className={styles.navLinkChild} href="/child/join">
              Вхід дитини
            </Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.card}>
          <h1 className={styles.title}>Реєстрація батьків</h1>
          <p className={styles.subTitle}>
            Створіть акаунт, щоб додати дитячі профілі та переглядати прогрес.
          </p>

          <form onSubmit={onSubmit} className={styles.form} noValidate>
            <label className={styles.label}>
              Email
              <input
                className={`${styles.input} ${fieldErrs.email ? styles.inputError : ""}`}
                placeholder="name@gmail.com"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  touchValidate();
                }}
                required
                autoComplete="email"
              />
              {fieldErrs.email && <div className={styles.hint}>{fieldErrs.email}</div>}
            </label>

            <label className={styles.label}>
              Username
              <input
                className={`${styles.input} ${fieldErrs.username ? styles.inputError : ""}`}
                placeholder="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  touchValidate();
                }}
                required
                autoComplete="username"
              />
              {fieldErrs.username && <div className={styles.hint}>{fieldErrs.username}</div>}
            </label>

            <label className={styles.label}>
              Пароль
              <input
                className={`${styles.input} ${fieldErrs.password ? styles.inputError : ""}`}
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  touchValidate();
                }}
                minLength={6}
                required
                autoComplete="new-password"
              />
              {fieldErrs.password && <div className={styles.hint}>{fieldErrs.password}</div>}
            </label>

            <label className={styles.label}>
              Повторіть пароль
              <input
                className={`${styles.input} ${fieldErrs.confirmPassword ? styles.inputError : ""}`}
                placeholder="••••••••"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  touchValidate();
                }}
                minLength={6}
                required
                autoComplete="new-password"
              />
              {fieldErrs.confirmPassword && (
                <div className={styles.hint}>{fieldErrs.confirmPassword}</div>
              )}
            </label>

            {fieldErrs.form && <div className={styles.err}>{fieldErrs.form}</div>}
            {serverErr && <div className={styles.err}>{serverErr}</div>}

            <button
              className={`${styles.primaryBtn} ${computed.canGlow ? styles.primaryBtnActive : ""}`}
              type="submit"
              disabled={loading}
            >
              {loading ? "Створення..." : "Створити акаунт"}
            </button>
          </form>

          <div className={styles.links}>
            <span className={styles.linksText}>Вже маєте акаунт?</span>{" "}
            <Link className={styles.linksLink} href="/login">
              Увійти
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          © {new Date().getFullYear()} Kids Learning
        </div>
      </footer>
    </div>
  );
}
