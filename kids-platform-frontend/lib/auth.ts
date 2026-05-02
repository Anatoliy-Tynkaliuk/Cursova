/**
 * 📘 ОГЛЯД ФАЙЛУ: `kids-platform-frontend/lib/auth.ts`.
 * ЩО ЦЕ: цей файл — частина навчальної платформи для дітей (бекенд API або фронтенд-екран).
 * НАВІЩО: реалізує конкретний шмат логіки (дані, перевірки, маршрути, або відображення інтерфейсу).
 * ЯК ПРАЦЮЄ: імпортує залежності, приймає вхідні дані, обробляє їх, та повертає результат/HTML/API-відповідь.
 * ВЗАЄМОДІЯ З ІНШИМИ ФАЙЛАМИ: через import/export, виклики сервісів, DTO, props, HTTP-запити.
 * ГЛОСАРІЙ:
 * - API: правила обміну даними між клієнтом (фронтенд) і сервером (бекенд).
 * - DTO: структура даних, яку дозволено приймати/повертати.
 * - Service: шар бізнес-логіки (обчислення, перевірки, робота з БД).
 * - Controller/Page: точка входу запиту користувача або сторінка інтерфейсу.
 * - Component: перевикористовуваний UI-блок.
 * - Prisma/ORM: інструмент доступу до бази даних через код.
 */


const TOKEN_KEY = "kids_token";

// Функція: setToken. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: setToken. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
// Функція: getToken. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: getToken. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
// Функція: logout. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: logout. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}
// Функція: isLoggedIn. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: isLoggedIn. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export function isLoggedIn(): boolean {
  return !!getToken();
}

// ---- child session ----
const CHILD_ID_KEY = "childProfileId";
const AGE_CODE_KEY = "ageGroupCode";
const CHILD_NAME_KEY = "childName";
const CHILD_AVATAR_KEY = "childAvatar";

// Функція: isValidAvatarPath. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: isValidAvatarPath. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
function isValidAvatarPath(value: string | null | undefined) {
  if (!value) return false;
  if (value === "undefined" || value === "null") return false;
  return value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://");
}

// Функція: setChildSession. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: setChildSession. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export function setChildSession(childProfileId: number, ageGroupCode: string, childName?: string, childAvatar?: string) {
  localStorage.setItem(CHILD_ID_KEY, String(childProfileId));
  localStorage.setItem(AGE_CODE_KEY, ageGroupCode);
  if (childName) {
    localStorage.setItem(CHILD_NAME_KEY, childName);
  }
  if (isValidAvatarPath(childAvatar)) {
    localStorage.setItem(CHILD_AVATAR_KEY, childAvatar);
  }
}

// Функція: getChildSession. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: getChildSession. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export function getChildSession() {
  const id = localStorage.getItem(CHILD_ID_KEY);
  const ageGroupCode = localStorage.getItem(AGE_CODE_KEY);
  const childName = localStorage.getItem(CHILD_NAME_KEY);
  const childAvatar = localStorage.getItem(CHILD_AVATAR_KEY);
  return {
    childProfileId: id ? Number(id) : null,
    ageGroupCode: ageGroupCode || null,
    childName: childName || null,
    childAvatar: isValidAvatarPath(childAvatar) ? childAvatar : null,
  };
}

// Функція: setChildAvatar. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: setChildAvatar. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export function setChildAvatar(avatar: string) {
  if (isValidAvatarPath(avatar)) {
    localStorage.setItem(CHILD_AVATAR_KEY, avatar);
    return;
  }
  localStorage.removeItem(CHILD_AVATAR_KEY);
}

// Функція: clearChildSession. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
// Функція: clearChildSession. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export function clearChildSession() {
  localStorage.removeItem(CHILD_ID_KEY);
  localStorage.removeItem(AGE_CODE_KEY);
  localStorage.removeItem(CHILD_NAME_KEY);
  localStorage.removeItem(CHILD_AVATAR_KEY);
}
