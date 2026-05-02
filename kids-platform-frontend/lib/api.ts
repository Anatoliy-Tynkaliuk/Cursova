/**
 * Огляд файлу: `kids-platform-frontend/lib/api.ts`.
 * Призначення: містить частину логіки бекенду/фронтенду платформи навчальних ігор.
 * Взаємодія: імпортує типи, сервіси та компоненти з сусідніх модулів і передає дані через DTO/API props.
 * Терміни: API — контракт обміну даними; DTO — тип вхідних/вихідних даних; Service — бізнес-логіка; Controller/Page — точка входу запитів або UI-екран.
 */

import { API_URL } from "./config";
import { getToken } from "./auth";

type Method = "GET" | "POST" | "PATCH" | "DELETE";

// Функція: api. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
export async function api<T>(path: string, method: Method = "GET", body?: any): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    let msg = "API error";
    try {
      const data = await res.json();
      msg = data?.message || msg;
    } catch {}
    throw new Error(msg);
  }

  return res.json();
}
