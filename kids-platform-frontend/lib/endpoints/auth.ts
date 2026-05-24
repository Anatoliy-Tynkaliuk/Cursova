import { api } from "../api";

export async function register(email: string, username: string, password: string) {
  return api<{ accessToken: string; user: { id: number; email: string; role: string } }>(
    "/auth/register",
    "POST",
    { email, username, password }
  );
}

export async function login(email: string, password: string) {
  return api<{ accessToken: string; user: { id: number; email: string; role: string } }>(
    "/auth/login",
    "POST",
    { email, password }
  );
}

export async function getMe() {
  return api<{ id: number; email: string; username: string; role: string }>("/auth/me", "GET");
}
