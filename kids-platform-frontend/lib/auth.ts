/**
 * Огляд файлу: `kids-platform-frontend/lib/auth.ts`.
 * Призначення: містить частину логіки бекенду/фронтенду платформи навчальних ігор.
 * Взаємодія: імпортує типи, сервіси та компоненти з сусідніх модулів і передає дані через DTO/API props.
 * Терміни: API — контракт обміну даними; DTO — тип вхідних/вихідних даних; Service — бізнес-логіка; Controller/Page — точка входу запитів або UI-екран.
 */

const TOKEN_KEY = "kids_token";

// Функція: setToken. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
// Функція: getToken. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
// Функція: logout. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}
// Функція: isLoggedIn. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
export function isLoggedIn(): boolean {
  return !!getToken();
}

// ---- child session ----
const CHILD_ID_KEY = "childProfileId";
const AGE_CODE_KEY = "ageGroupCode";
const CHILD_NAME_KEY = "childName";
const CHILD_AVATAR_KEY = "childAvatar";

// Функція: isValidAvatarPath. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
function isValidAvatarPath(value: string | null | undefined) {
  if (!value) return false;
  if (value === "undefined" || value === "null") return false;
  return value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://");
}

// Функція: setChildSession. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
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
export function setChildAvatar(avatar: string) {
  if (isValidAvatarPath(avatar)) {
    localStorage.setItem(CHILD_AVATAR_KEY, avatar);
    return;
  }
  localStorage.removeItem(CHILD_AVATAR_KEY);
}

// Функція: clearChildSession. Виконує локальну частину логіки файлу та взаємодіє з залежностями через параметри/імпорти.
export function clearChildSession() {
  localStorage.removeItem(CHILD_ID_KEY);
  localStorage.removeItem(AGE_CODE_KEY);
  localStorage.removeItem(CHILD_NAME_KEY);
  localStorage.removeItem(CHILD_AVATAR_KEY);
}
