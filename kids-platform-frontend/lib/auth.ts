const TOKEN_KEY = "kids_token";

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}
export function isLoggedIn(): boolean {
  return !!getToken();
}

// ---- child session ----
const CHILD_ID_KEY = "childProfileId";
const AGE_CODE_KEY = "ageGroupCode";
const CHILD_NAME_KEY = "childName";

export function setChildSession(childProfileId: number, ageGroupCode: string, childName?: string) {
  localStorage.setItem(CHILD_ID_KEY, String(childProfileId));
  localStorage.setItem(AGE_CODE_KEY, ageGroupCode);
  if (childName) {
    localStorage.setItem(CHILD_NAME_KEY, childName);
  }
}

export function getChildSession() {
  const id = localStorage.getItem(CHILD_ID_KEY);
  const ageGroupCode = localStorage.getItem(AGE_CODE_KEY);
  const childName = localStorage.getItem(CHILD_NAME_KEY);
  return {
    childProfileId: id ? Number(id) : null,
    ageGroupCode: ageGroupCode || null,
    childName: childName || null,
  };
}

export function clearChildSession() {
  localStorage.removeItem(CHILD_ID_KEY);
  localStorage.removeItem(AGE_CODE_KEY);
  localStorage.removeItem(CHILD_NAME_KEY);
}
