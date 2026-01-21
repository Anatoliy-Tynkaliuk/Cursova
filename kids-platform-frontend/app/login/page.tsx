"use client";

import { useState, type FormEvent } from "react";
import { login } from "@/lib/endpoints";
import { setToken } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    try {
      const data = await login(email, password);
      setToken(data.accessToken);
      window.location.href = data.user.role === "admin" ? "/admin" : "/children";
    } catch (e: any) {
      setErr(e.message ?? "Error");
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
        <div className="mb-2 text-2xl font-bold">Вхід для батьків</div>
        <div className="mb-4 text-gray-600">Увійди, щоб керувати профілями дітей.</div>

        <form onSubmit={onSubmit} className="grid gap-3">
          <input
            className="rounded-lg border border-gray-300 px-3 py-2"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="rounded-lg border border-gray-300 px-3 py-2"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="rounded-xl bg-black py-3 font-semibold text-white" type="submit">
            Увійти
          </button>
          {err && <p className="text-sm text-red-600">{err}</p>}
        </form>

        <div className="mt-4 text-sm text-gray-600">
          Немає акаунта?{" "}
          <a className="font-semibold text-black" href="/register">
            Зареєструватися
          </a>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Вхід для дитини?{" "}
          <a className="font-semibold text-black" href="/child/join">
            Ввести код
          </a>
        </div>
      </div>
    </div>
  );
}
