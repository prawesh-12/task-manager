import type { SessionUser } from "./types";

const TOKEN_KEY = "task-manager-token";

type JwtPayload = {
  sub: string;
  email?: string;
  name?: string;
  exp?: number;
};

export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export function logout() {
  clearToken();
  window.location.href = "/";
}

export function getSessionUser(): SessionUser | null {
  const token = getToken();
  if (!token) {
    return null;
  }

  try {
    const payload = decodeJwt(token);
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      clearToken();
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    clearToken();
    return null;
  }
}

function decodeJwt(token: string): JwtPayload {
  const [, payload] = token.split(".");
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const decoded = window.atob(normalized);
  return JSON.parse(decoded);
}
