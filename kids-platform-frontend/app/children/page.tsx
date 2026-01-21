"use client";

import { useEffect, useState } from "react";
import { getChildren, createChild, createInvite } from "@/lib/endpoints";
import { isLoggedIn, logout, setChildSession } from "@/lib/auth";

type Child = { id: number; name: string; ageGroupCode: string };

export default function ParentChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [name, setName] = useState("");
  const [ageGroupCode, setAgeGroupCode] = useState("3_5");
  const [inviteCode, setInviteCode] = useState<string>("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

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
    setErr(""); setMsg(""); setInviteCode("");
    try {
      const c = await createChild(name.trim(), ageGroupCode);
      setMsg(`Дитину створено: ${c.name}`);
      setName("");
      await load();
    } catch (e: any) {
      setErr(e.message ?? "Error");
    }
  }

  async function onInvite(childId: number) {
    setErr(""); setMsg("");
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

  return (
    <div style={{ padding: 16, maxWidth: 700 }}>
      <h1>Кабінет батьків</h1>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={onLogout}>Вийти</button>
      </div>

      {err && <p style={{ color: "red" }}>{err}</p>}
      {msg && <p>{msg}</p>}

      <hr />

      <h2>Створити дитину</h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          placeholder="Ім'я дитини"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select value={ageGroupCode} onChange={(e) => setAgeGroupCode(e.target.value)}>
          <option value="3_5">3–5</option>
          <option value="6_8">6–8</option>
          <option value="9_12">9–12</option>
        </select>
        <button onClick={onCreateChild} disabled={!name.trim()}>
          Додати
        </button>
      </div>

      <hr />

      <h2>Мої діти</h2>
      {children.length === 0 ? (
        <p>Ще немає дітей. Створи перший профіль.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
          {children.map((c) => (
            <li key={c.id} style={{ border: "1px solid #333", borderRadius: 10, padding: 12 }}>
              <div style={{ fontWeight: 700 }}>{c.name}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Вік: {c.ageGroupCode}</div>

              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <button onClick={() => onSelectChild(c)}>Увійти як дитина</button>
                <button onClick={() => onInvite(c.id)}>Створити код</button>
                <a href={`/children/${c.id}/stats`} style={{ alignSelf: "center" }}>
                  Статистика
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}

      {inviteCode && (
        <div style={{ marginTop: 16, padding: 12, border: "1px dashed #666", borderRadius: 10 }}>
          <div style={{ fontWeight: 700 }}>Код для входу дитини:</div>
          <div style={{ fontSize: 24, letterSpacing: 2 }}>{inviteCode}</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            Дитина вводить цей код на сторінці /child/join
          </div>
        </div>
      )}
    </div>
  );
}
