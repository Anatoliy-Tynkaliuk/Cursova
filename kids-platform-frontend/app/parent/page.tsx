"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../parent/parent-dashboard.module.css";
import { getChildren, createChild, createInvite, deleteChild, getMe } from "@/lib/endpoints";
import { isLoggedIn, logout, setChildSession } from "@/lib/auth";

type Child = { id: number; name: string; ageGroupCode: string; avatar?: string | null };

function ageLabel(code: string) {
  if (code === "4_5") return "4–5";
  if (code === "6_8") return "6–8";
  if (code === "9_12") return "9–12";
  return code;
}

function avatarFor(index: number) {
  const arr = [  "/Parent_dashboard/child_avatar_1.png"];
  return arr[index % arr.length];
}

export default function ParentChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [name, setName] = useState("");
  const [ageGroupCode, setAgeGroupCode] = useState("4_5");
  const [inviteCode, setInviteCode] = useState<string>("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [parentName, setParentName] = useState("");
  const [deleteCandidate, setDeleteCandidate] = useState<Child | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    Promise.all([load(), getMe().then((me) => setParentName(me.username || me.email))]).catch((e: any) =>
      setErr(e.message ?? "Error")
    );
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

  async function onDeleteChild() {
    if (!deleteCandidate) return;
    setErr("");
    setMsg("");
    setInviteCode("");
    try {
      setIsDeleting(true);
      await deleteChild(deleteCandidate.id);
      setMsg(`Профіль "${deleteCandidate.name}" видалено.`);
      setDeleteCandidate(null);
      await load();
    } catch (e: any) {
      setErr(e.message ?? "Error");
    } finally {
      setIsDeleting(false);
    }
  }

  function onSelectChild(c: Child) {
    setChildSession(c.id, c.ageGroupCode, c.name, c.avatar || undefined);
    window.location.href = "/child/subjects";
  }

  function onLogout() {
    logout();
    window.location.href = "/login";
  }

  const parentDisplayName = useMemo(() => parentName || "Батьки", [parentName]);

  return (
    <div className={styles.page}>
      <div className={styles.bg} />
      <div className={styles.overlay} />
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerTitle}>Панель Батьків</div>
          <button className={styles.logoutBtn} onClick={onLogout}>
            Вийти
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <h1 className={styles.welcome}>Вітаємо, {parentDisplayName}!</h1>

        {(err || msg) && (
          <div className={styles.alerts}>
            {err && <div className={styles.err}>{err}</div>}
            {msg && <div className={styles.msg}>{msg}</div>}
          </div>
        )}

        {inviteCode && (
          <section className={styles.inviteStandalone}>
            <div className={styles.inviteTitle}>Код для входу дитини:</div>
            <div className={styles.inviteCode}>{inviteCode}</div>
          </section>
        )}

        <section className={styles.panel}>
          <div className={styles.cards}>
            {children.map((c, idx) => (
              <div key={c.id} className={styles.card}>
              <button
                className={styles.deleteBtn}
                onClick={() => setDeleteCandidate(c)}
                title="Видалити дитину"
                aria-label="delete"
              >
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

        {showCreate && (
          <section className={styles.createBox}>
            <div className={styles.createHeader}>
              <div className={styles.createTitle}>Створити дитину</div>
              <button
                className={styles.closeBtn}
                onClick={() => {
                  setShowCreate(false);
                  setName("");
                }}
                aria-label="close"
              >
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
                <option value="4_5">4–5</option>
                <option value="6_8">6–8</option>
                <option value="9_12">9–12</option>
              </select>

              <button className={styles.primaryBtn} onClick={onCreateChild} disabled={!name.trim()}>
                Додати
              </button>
            </div>
          </section>
        )}


        {deleteCandidate && (
          <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="delete-child-title">
            <div className={styles.modalCard}>
              <h2 id="delete-child-title" className={styles.modalTitle}>Підтвердження видалення</h2>
              <p className={styles.modalText}>
                Ви дійсно хочете видалити профіль дитини <strong>"{deleteCandidate.name}"</strong>?
                <br />
                Цю дію не можна скасувати.
              </p>
              <div className={styles.modalActions}>
                <button className={styles.modalCancelBtn} onClick={() => setDeleteCandidate(null)} disabled={isDeleting}>Скасувати</button>
                <button className={styles.modalDeleteBtn} onClick={onDeleteChild} disabled={isDeleting}>
                  {isDeleting ? "Видалення..." : "Видалити"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
