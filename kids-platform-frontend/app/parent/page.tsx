"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../parent/parent-dashboard.module.css";

import { getChildren, createChild, createInvite } from "@/lib/endpoints";
import { isLoggedIn, logout, setChildSession } from "@/lib/auth";

type Child = { id: number; name: string; ageGroupCode: string };

function ageLabel(code: string) {
  if (code === "3_5") return "3–5";
  if (code === "6_8") return "6–8";
  if (code === "9_12") return "9–12";
  return code;
}

function avatarFor(index: number) {
  const arr = ["/avatars/kid1.png", "/avatars/kid2.png", "/avatars/kid3.png"];
  return arr[index % arr.length];
}

export default function ParentChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [name, setName] = useState("");
  const [ageGroupCode, setAgeGroupCode] = useState("3_5");
  const [inviteCode, setInviteCode] = useState<string>("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // ✅ новий стан: показувати/ховати форму
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    setErr("");
    const data = await getChildren();
    setChildren(data);
  }

  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = "/login";
      return;
    }
    load().catch((e: any) => setErr(e.message ?? "Error"));
  }, []);

  async function onCreateChild() {
    setErr("");
    setMsg("");
    setInviteCode("");
    try {
      const c = await createChild(name.trim(), ageGroupCode);
      setMsg(`Дитину створено: ${c.name}`);
      setName("");
      await load();

      // ✅ після успіху ховаємо форму
      setShowCreate(false);
    } catch (e: any) {
      setErr(e.message ?? "Error");
    }
  }

  async function onInvite(childId: number) {
    setErr("");
    setMsg("");
    try {
      const r = await createInvite(childId);
      setInviteCode(r.code);
      setMsg("Код створено. Дай його дитині для входу.");
    } catch (e: any) {
      setErr(e.message ?? "Error");
    }
  }

  function onSelectChild(c: Child) {
    setChildSession(c.id, c.ageGroupCode);
    window.location.href = "/child";
  }

  function onLogout() {
    logout();
    window.location.href = "/login";
  }

  const parentName = useMemo(() => "Олено", []);

  return (
    <div className={styles.page}>
      <div className={styles.bg} />
      <div className={styles.overlay} />

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerTitle}>Панель Батьків / Parent Dashboard</div>
          <button className={styles.logoutBtn} onClick={onLogout}>
            Вийти
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <h1 className={styles.welcome}>Вітаємо, {parentName}!</h1>

        {(err || msg) && (
          <div className={styles.alerts}>
            {err && <div className={styles.err}>{err}</div>}
            {msg && <div className={styles.msg}>{msg}</div>}
          </div>
        )}

        <section className={styles.panel}>
          <div className={styles.cards}>
            {children.map((c, idx) => (
              <div key={c.id} className={styles.card}>
  {/* ❌ кнопка видалення */}
  <button
    className={styles.deleteBtn}
    onClick={() => onDeleteChild(c.id, c.name)}
    title="Видалити дитину"
  >
    ✕
  </button>

  <div className={styles.cardTop}>
    <div className={styles.avatarWrap}>
      <img className={styles.avatar} src={avatarFor(idx)} alt="avatar" />
    </div>
    <div className={styles.childName}>{c.name}</div>
  </div>

  <div className={styles.ageLine}>Вік: {ageLabel(c.ageGroupCode)}</div>

  <button
    className={styles.greenBtn}
    onClick={() => (window.location.href = `/children/${c.id}/stats`)}
  >
    Перегляд досягнень
  </button>

  <div className={styles.rowBtns}>
    <button className={styles.purpleBtn} onClick={() => onInvite(c.id)}>
      Код входу
    </button>
    <button className={styles.purpleBtn} onClick={() => onSelectChild(c)}>
      Зайти як дитина
    </button>
  </div>
</div>

            ))}
          </div>

          <div className={styles.addChildArea}>
            <button
              className={styles.addChildBtn}
              onClick={() => {
                setShowCreate(true);
                setErr("");
                setMsg("");
                setInviteCode("");
              }}
            >
              <span className={styles.plus}>＋</span> Додати дитину
            </button>
          </div>
        </section>

        {/* ✅ форма показується ТІЛЬКИ якщо showCreate === true */}
        {showCreate && (
          <section className={styles.createBox}>
            <div className={styles.createHeader}>
              <div className={styles.createTitle}>Створити дитину</div>

              {/* кнопка закриття (опціонально) */}
              <button
                className={styles.closeBtn}
                onClick={() => {
                  setShowCreate(false);
                  setName("");
                }}
                aria-label="close"
              >
                ✕
              </button>
            </div>

            <div className={styles.formRow}>
              <input
                className={styles.input}
                placeholder="Ім'я дитини"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <select
                className={styles.select}
                value={ageGroupCode}
                onChange={(e) => setAgeGroupCode(e.target.value)}
              >
                <option value="3_5">3–5</option>
                <option value="6_8">6–8</option>
                <option value="9_12">9–12</option>
              </select>

              <button className={styles.primaryBtn} onClick={onCreateChild} disabled={!name.trim()}>
                Додати
              </button>
            </div>

            {inviteCode && (
              <div className={styles.inviteBox}>
                <div className={styles.inviteTitle}>Код для входу дитини:</div>
                <div className={styles.inviteCode}>{inviteCode}</div>
                <div className={styles.inviteHint}>Дитина вводить цей код на сторінці /child/join</div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
