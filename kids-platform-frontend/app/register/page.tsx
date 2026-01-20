"use client";

import { useState } from "react";
import { setToken } from "@/lib/auth";
import { register } from "@/lib/endpoints";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e: any) {
    e.preventDefault();
    setErr("");
    try {
      const data = await register(email, password);
      setToken(data.accessToken);
      window.location.href = "/parent";
    } catch (e: any) {
      setErr(e.message ?? "Error");
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 360 }}>
      <h1>Реєстрація батьків</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Створити акаунт</button>
        {err && <p style={{ color: "red" }}>{err}</p>}
      </form>
    </div>
  );
}
