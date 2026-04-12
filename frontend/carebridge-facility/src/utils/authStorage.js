const TOKEN_KEY = "carebridge_access_token";
const USER_KEY = "carebridge_user";

export function saveAuth(authData) {
  localStorage.setItem(TOKEN_KEY, authData.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(authData.user));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}
