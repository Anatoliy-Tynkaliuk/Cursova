"use client";

import { useState, type FormEvent } from "react";
import { setToken } from "@/lib/auth";
import { register } from "@/lib/endpoints";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    try {
      if (password !== confirmPassword) {
        setErr("Паролі не співпадають");
        return;
      }
      const data = await register(email, username, password);
      setToken(data.accessToken);
      window.location.href = data.user.role === "admin" ? "/admin" : "/parent";
    } catch (e: any) {
      setErr(e.message ?? "Error");
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
        <div className="mb-2 text-2xl font-bold">Реєстрація батьків</div>
        <div className="mb-4 text-gray-600">
          Створіть акаунт, щоб додати дитячі профілі та переглядати прогрес.
        </div>

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
            placeholder="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="rounded-lg border border-gray-300 px-3 py-2"
            placeholder="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <input
            className="rounded-lg border border-gray-300 px-3 py-2"
            placeholder="Повторіть пароль"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
            required
          />
          <button className="rounded-xl bg-black py-3 font-semibold text-white" type="submit">
            Створити акаунт
          </button>
          {err && <p className="text-sm text-red-600">{err}</p>}
        </form>

        <div className="mt-4 text-sm text-gray-600">
          Вже маєте акаунт?{" "}
          <a className="font-semibold text-black" href="/login">
            Увійти
          </a>
        </div>
      </div>
    </div>
  );
}
