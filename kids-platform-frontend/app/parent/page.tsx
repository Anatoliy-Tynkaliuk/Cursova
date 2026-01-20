"use client";

import { useEffect, useState } from "react";
import { createChild, createInvite, getChildren } from "@/lib/endpoints";

type Child = { id: number; name: string; ageGroupCode: string };

export default function ParentPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [err, setErr] = useState("");

  const [name, setName] = useState("");
  const [ageGroupCode, setAgeGroupCode] = useState("3_5");

  const [inviteInfo, setInviteInfo] = useState<any>(null);

  async function load() {
    setErr("");
    try {
      const data = await getChildren();
      setChildren(data);
    } catch (e: any) {
      setErr(e.message ?? "Error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  function selectChild(c: Child) {
    localStorage.setItem("childProfileId", String(c.id));
    localStorage.setItem("ageGroupCode", c.ageGroupCode);
    window.location.href = "/child";
  }

  async function onCreateChild() {
    setErr("");
    try {
      await createChild(name, ageGroupCode);
      setName("");
      await load();
    } catch (e: any) {
      setErr(e.message ?? "Error");
    }
  }

  async function onInvite(childId: number) {
    setErr("");
    try {
      const inv = await createInvite(childId);
      setInviteInfo(inv);
    } catch (e: any) {
      setErr(e.message ?? "Error");
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Кабінет батьків</h1>
      {err && <p style={{ color: "red" }}>{err}</p>}

      <div style={{ border: "1px solid #333", borderRadius: 10, padding: 12, maxWidth: 420, marginBottom: 16 }}>
        <h3>Додати дитину</h3>
        <input placeholder="Імʼя" value={name} onChange={(e) => setName(e.target.value)} />
        <div style={{ height: 8 }} />
        <input placeholder="AgeGroupCode (наприклад 3_5)" value={ageGroupCode} onChange={(e) => setAgeGroupCode(e.target.value)} />
        <div style={{ height: 8 }} />
        <button onClick={onCreateChild} disabled={!name.trim()}>
          Створити
        </button>
      </div>

      {inviteInfo && (
        <div style={{ border: "1px solid #999", borderRadius: 10, padding: 12, maxWidth: 420, marginBottom: 16 }}>
          <div><b>Код для входу дитини:</b> {inviteInfo.code}</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>дійсний до: {String(inviteInfo.expiresAt)}</div>
        </div>
      )}

      <h3>Діти</h3>
      {children.length === 0 ? (
        <p>Немає дітей</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10, maxWidth: 420 }}>
          {children.map((c) => (
            <li key={c.id} style={{ border: "1px solid #333", borderRadius: 10, padding: 12 }}>
              <div style={{ fontWeight: 700 }}>{c.name}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>ageGroup: {c.ageGroupCode}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={() => selectChild(c)}>Грати</button>
                <button onClick={() => onInvite(c.id)}>Отримати код</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
