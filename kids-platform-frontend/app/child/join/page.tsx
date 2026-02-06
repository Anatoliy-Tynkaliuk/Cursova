"use client";

import { useState } from "react";
import { joinByCode } from "@/lib/endpoints";
import { setChildSession } from "@/lib/auth";

export default function JoinPage() {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");

  async function onJoin() {
    setMsg("");
    try {
      const data = await joinByCode(code);
      setChildSession(data.childProfileId, data.ageGroupCode, data.childName);
      window.location.href = "/child/subjects";
    } catch (e: any) {
      setMsg(e.message ?? "Error");
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 360 }}>
      <h1>Вхід для дитини</h1>
      <input placeholder="Введи код" value={code} onChange={(e) => setCode(e.target.value)} />
      <div style={{ height: 8 }} />
      <button onClick={onJoin} disabled={!code.trim()}>
        Увійти
      </button>
      {msg && <p style={{ color: "red" }}>{msg}</p>}
    </div>
  );
}
